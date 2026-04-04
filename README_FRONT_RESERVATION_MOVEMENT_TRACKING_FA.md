# راهنمای کامل فرانت‌اند: Reservation + Movement Related + Realtime Tracking

این سند برای تیم فرانت‌اند نوشته شده تا فقط با همین راهنما بتواند بخش‌های رزرو، رهگیری لحظه‌ای بار، پرداخت‌های مرتبط و داده‌های وابسته را پیاده‌سازی کند.

**مهم:** در این سند، endpointهای مخصوص ادمین عمداً ذکر نشده‌اند.

---

## 1) دامنه این README

این راهنما شامل این بخش‌ها است:

- ساخت رزرو و مدیریت رزروهای کاربر
- دریافت داده‌های پایه مورد نیاز رزرو (ایستگاه/نوع واگن/قیمت/ظرفیت)
- رهگیری لحظه‌ای محموله با tracking code
- تاریخچه پرداخت کاربر و درخواست پرداخت
- الگوی پیشنهادی state management و polling برای realtime tracking

---

## 2) پیش‌نیازهای فنی

- Base URL: `https://167.86.71.135:8000/api`
- Authentication: JWT Bearer Token
- هدر:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

- همه endpointهای این سند نیازمند احراز هویت هستند.

---

## 3) Endpoint Map (فقط فرانت، غیرادمین)

## 3.1 Auth مورد نیاز فرانت

- `POST /api/auth/signup/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `POST /api/auth/forgot-password/`
- `POST /api/auth/verify-reset-code/`
- `POST /api/auth/reset-password/`

## 3.2 داده‌های پایه رزرو (Core)

- `GET /api/core/stations/`
- `GET /api/core/stations/{id}/`
- `GET /api/core/stations/{id}/destinations/`
- `GET /api/core/stations/journey_availability/?origin={origin_id}&destination={destination_id}`
- `GET /api/core/wagon-types/`
- `GET /api/core/wagon-types/{id}/`
- `GET /api/core/wagon-types/{id}/journeys/`
- `GET /api/core/wagon-types/{id}/availability/`

> Alias سازگاری: همین endpointها از `/api/cargo/...` هم قابل دسترسی هستند.

### 3.2.1 Core API — response bodies (English, for React)

All Core endpoints below require `Authorization: Bearer <access_token>`. Replace `{id}` with a numeric primary key.

---

#### `GET /api/core/stations/`

**Success — `200 OK`**

Returns a **JSON array** of station objects (no pagination wrapper unless changed globally).

```json
[
  {
    "id": 1,
    "name": "Kabul Central",
    "code": "KBL",
    "country": "Afghanistan",
    "province_or_state": "Kabul",
    "city": "Kabul",
    "description": "",
    "allowed_destinations_count": 5,
    "total_available_wagons": 12
  }
]
```

---

#### `GET /api/core/stations/{id}/`

**Success — `200 OK`**

```json
{
  "id": 1,
  "name": "Kabul Central",
  "code": "KBL",
  "country": "Afghanistan",
  "province_or_state": "Kabul",
  "city": "Kabul",
  "description": "",
  "allowed_destinations": [
    {
      "id": 2,
      "name": "Herat",
      "code": "HRT",
      "country": "Afghanistan",
      "province_or_state": "Herat",
      "city": "Herat"
    }
  ],
  "wagon_availability": {
    "wagon_availability_by_type": [
      {
        "wagon_type_id": 3,
        "wagon_type_name": "Standard Cargo",
        "total": 10,
        "available": 7,
        "reserved": 1,
        "in_transit": 1,
        "maintenance": 1
      }
    ],
    "total_wagons_all_types": 10
  }
}
```

**Errors:** `404` if station does not exist or is inactive (`{"detail": "Not found."}`).

---

#### `GET /api/core/stations/{id}/destinations/`

**Success — `200 OK`**

```json
{
  "station": {
    "id": 1,
    "name": "Kabul Central",
    "code": "KBL"
  },
  "destinations": [
    {
      "id": 2,
      "name": "Herat",
      "code": "HRT",
      "country": "Afghanistan"
    }
  ]
}
```

---

#### `GET /api/core/stations/journey_availability/?origin={origin_id}&destination={destination_id}`

Query parameters **`origin`** and **`destination`** are **required** (station IDs).

**Success — `200 OK`**

```json
{
  "origin": {
    "id": 1,
    "name": "Kabul Central",
    "code": "KBL"
  },
  "destination": {
    "id": 2,
    "name": "Herat",
    "code": "HRT"
  },
  "wagon_types": [
    {
      "wagon_type_id": 3,
      "wagon_type_name": "Standard Cargo",
      "capacity": 60.0,
      "available_count": 5,
      "price_usd": 1200.0,
      "price_afn": 85000.0
    }
  ]
}
```

`wagon_types` may be an **empty array** if no priced wagon types exist for that journey.

**Errors**

- `400` — missing params: `{"error": "Both origin and destination parameters are required"}`
- `400` — not reachable: `{"error": "<Destination> is not reachable from <Origin>"}`
- `404` — invalid station: `{"error": "Station not found"}`

---

#### `GET /api/core/wagon-types/`

**Optional query (for per-journey pricing on list):**  
`?origin_station={origin_id}&destination_station={destination_id}`  
If both are valid active stations, each item may include a non-null `pricing` object; otherwise `pricing` is `null`.

**Success — `200 OK`**

```json
[
  {
    "id": 3,
    "type_name": "Standard Cargo",
    "capacity": "60.00",
    "capacity_volume": "120.00",
    "specifications": {},
    "pricing": null,
    "available_wagons_count": 42,
    "total_wagons_count": 50
  }
]
```

When `pricing` is present (same journey as query params):

```json
"pricing": {
  "base_price_usd": "1200.00",
  "total_price_usd": 1200.0,
  "base_price_afn": "85000.00",
  "total_price_afn": 85000.0
}
```

Note: `capacity` / `capacity_volume` are serialized as **strings** (decimal); `specifications` is a JSON object.

---

#### `GET /api/core/wagon-types/{id}/`

Same object shape as a **single element** in `GET /api/core/wagon-types/`. Optional query  
`?origin_station={origin_id}&destination_station={destination_id}` applies the same way.

**Errors:** `404` if wagon type not found.

---

#### `GET /api/core/wagon-types/{id}/journeys/`

**Success — `200 OK`**

Returns a **JSON array** (one entry per configured `WagonTypePrice` row).

```json
[
  {
    "origin": {
      "id": 1,
      "name": "Kabul Central",
      "code": "KBL"
    },
    "destination": {
      "id": 2,
      "name": "Herat",
      "code": "HRT"
    },
    "price_usd": 1200.0,
    "price_afn": 85000.0
  }
]
```

---

#### `GET /api/core/wagon-types/{id}/availability/`

Counts are **global** for that wagon type (all stations), not per station.

**Success — `200 OK`**

```json
{
  "wagon_type": {
    "id": 3,
    "name": "Standard Cargo",
    "capacity": 60.0
  },
  "available_count": 30,
  "total_count": 50,
  "reserved_count": 5,
  "in_transit_count": 8,
  "maintenance_count": 4,
  "out_of_service_count": 3
}
```

## 3.3 رزرو (Reservation)

- `GET /api/reservations/reservations/`
- `POST /api/reservations/reservations/`
- `GET /api/reservations/reservations/{id}/`
- `POST /api/reservations/reservations/track/`  (نسخه اکشن)
- `POST /api/reservations/reservations/request-payment/`
- `GET /api/reservations/reservations/my-payment-requests/`

## 3.4 Tracking (مسیر اصلی پیشنهاد‌شده برای فرانت)

- `GET /api/reservations/track/{tracking_code}/`

## 3.5 Payment History کاربر

- `GET /api/reservations/merchant/payments/`

## 3.6 Payment Request چت‌محور (اختیاری، اما مرتبط)

- `POST /api/payments/request/`

---

## 4) جریان کامل پیاده‌سازی در فرانت

## 4.1 صفحه Create Reservation (Wizard)

پیشنهاد مرحله‌ای:

1. `GET /api/core/stations/` برای لیست مبداها
2. انتخاب مبدا → `GET /api/core/stations/{id}/destinations/`
3. انتخاب مقصد → `GET /api/core/stations/journey_availability/?origin=...&destination=...`
4. نمایش wagon typeهای قابل رزرو + قیمت + تعداد موجود
5. ارسال نهایی رزرو با `POST /api/reservations/reservations/`

Body نمونه:

```json
{
  "origin_station": 1,
  "destination_station": 2,
  "wagon_type": 3,
  "number_of_wagons": 4,
  "cargo_description": "Steel materials",
  "cargo_weight": "12500",
  "special_requirements": "Keep dry",
  "notes": "Handle carefully"
}
```

پاسخ موفق (خلاصه):

```json
{
  "id": 123,
  "status": "pending",
  "status_display": "Pending",
  "origin_station_name": "Kabul",
  "destination_station_name": "Herat",
  "wagon_type_name": "Covered Wagon",
  "number_of_wagons": 4,
  "calculated_price_usd": "3500.00",
  "calculated_price_afn": "245000.00",
  "estimated_delivery_time": "2026-04-03T10:00:00Z"
}
```

---

## 4.2 صفحه My Reservations

- لیست: `GET /api/reservations/reservations/`
- فیلتر وضعیت:
  - `GET /api/reservations/reservations/?status=pending`

در کارت رزرو نمایش دهید:

- `status` (عملیاتی)
- `financially_settled` (مالی)
- `tracking_code` (اگر موجود است)
- مبلغ محاسبه شده

---

## 4.3 صفحه Reservation Detail

- `GET /api/reservations/reservations/{id}/`

برای UI این بخش‌ها را بسازید:

- اطلاعات مبدا/مقصد/نوع واگن/تعداد
- قیمت کل
- لیست پرداخت‌ها (`payments`)
- واگن‌های اختصاص‌داده‌شده (`assigned_wagons`)
- کد رهگیری (`tracking_code`)

---

## 5) Realtime Tracking (با جزئیات کامل)

در این پروژه realtime tracking از طریق **polling روی HTTP** انجام می‌شود (WebSocket برای tracking وجود ندارد).

## 5.1 Endpoint اصلی tracking

- `GET /api/reservations/track/{tracking_code}/`

این endpoint برای فرانت **پایدارتر و مینیمال‌تر** است.

خروجی کلیدی:

- `tracking_code`
- `journey.from / journey.to`
- `movement.identifier` (شماره قطار)
- `current_position` (آخرین GPS)

نمونه پاسخ:

```json
{
  "tracking_code": "TRK123ABC",
  "journey": {
    "from": "Kabul",
    "from_code": "KBL",
    "from_latitude": 34.55,
    "from_longitude": 69.20,
    "to": "Herat",
    "to_code": "HRT",
    "to_latitude": 34.35,
    "to_longitude": 62.20
  },
  "movement": {
    "identifier": "TN-2041"
  },
  "current_position": {
    "latitude": 34.10,
    "longitude": 67.90,
    "altitude": null,
    "speed": 43.2,
    "heading": 120.0,
    "accuracy": 5.0,
    "location_name": "Near Ghazni",
    "timestamp": "2026-03-27T11:15:00Z"
  }
}
```

## 5.2 حالت‌های مهم tracking در UI

### حالت A: حرکت هنوز assign نشده

پاسخ شامل:

- `movement: null`
- `current_position: null`
- `message: "Movement not yet assigned"`

UI:

- نمایش وضعیت: "در انتظار اختصاص حرکت"
- ادامه polling با فاصله بیشتر

### حالت B: حرکت assign شده ولی GPS موقتاً موجود نیست

- `movement` موجود است ولی `current_position` ممکن است null باشد

UI:

- نمایش "آخرین موقعیت در دسترس نیست"
- مسیر journey همچنان نمایش داده شود

### حالت C: داده موقعیت موجود

- marker روی نقشه از `current_position.lat/lng`
- نمایش `location_name`, `speed`, `timestamp`

## 5.3 پیشنهاد Polling Strategy (Realtime UX)

پیشنهاد استاندارد:

- هنگام باز بودن صفحه tracking:
  - هر `10` تا `15` ثانیه یک درخواست
- وقتی اپ در background است:
  - polling متوقف یا کند (مثلا هر `60` ثانیه)
- اگر 429/5xx دریافت شد:
  - exponential backoff:
    - 15s → 30s → 60s → 120s
- وقتی کاربر صفحه را می‌بندد:
  - polling را کامل stop کنید

## 5.4 تشخیص تغییر داده برای redraw

برای جلوگیری از redraw غیرضروری:

- اگر `current_position.timestamp` تغییر نکرده، marker را آپدیت نکنید
- فقط زمانی polyline/marker/state را update کنید که:
  - timestamp جدیدتر باشد
  - یا movement از null به مقدار واقعی تغییر کند

---

## 6) endpoint جایگزین tracking (اکشن)

Endpoint:

- `POST /api/reservations/reservations/track/`

Body:

```json
{
  "code": "TRK123ABC"
}
```

نکته:

- این مسیر هم کار می‌کند، اما برای UI عمومی tracking مسیر GET (`/track/{tracking_code}`) توصیه می‌شود.

---

## 7) Payment Requests و Payment History

## 7.1 ایجاد درخواست پرداخت (درون ماژول رزرو)

- `POST /api/reservations/reservations/request-payment/`

Body:

```json
{
  "reservation_id": 123
}
```

## 7.2 لیست درخواست‌های پرداخت من

- `GET /api/reservations/reservations/my-payment-requests/`

فیلدهای مهم:

- `status`
- `status_display`
- `admin_response`
- `responded_at`

## 7.3 تاریخچه پرداخت‌های من

- `GET /api/reservations/merchant/payments/`

نمایش در UI:

- شماره قسط
- مبلغ و ارز
- وضعیت پرداخت
- تاریخ ایجاد/تایید

## 7.4 Payment Request چت‌محور (اختیاری)

- `POST /api/payments/request/`

Body:

```json
{
  "reservation_id": 123
}
```

خروجی شامل `messages_sent` و `recipients` است (برای اطلاع فرانت از ارسال اعلان به ادمین‌ها).

---

## 8) مدیریت خطاها (فرانت)

- `400 Bad Request`
  - مقصد نامعتبر برای مبدا
  - ظرفیت واگن ناکافی
  - tracking code منقضی/غیرفعال
- `401 Unauthorized`
  - access token نامعتبر/منقضی
- `403 Forbidden`
  - دسترسی خارج از مالکیت داده
- `404 Not Found`
  - رزرو یا tracking code نامعتبر
- `429 Too Many Requests`
  - رعایت backoff
- `500+`
  - retry کنترل‌شده + پیام مناسب

---

## 9) مدل State پیشنهادی برای فرانت

پیشنهاد storeها:

- `reservationStore`
  - `list`, `detail`, `createForm`, `filters`, `errors`
- `trackingStore`
  - `trackingCode`, `journey`, `movement`, `currentPosition`, `pollingState`
- `paymentStore`
  - `merchantPayments`, `myPaymentRequests`, `requestPaymentStatus`
- `lookupStore`
  - `stations`, `destinationsByStation`, `journeyAvailability`, `wagonTypes`

---

## 10) چک‌لیست نهایی پیاده‌سازی فرانت

- [ ] login/signup/refresh/logout یکپارچه
- [ ] wizard ساخت رزرو با مرحله‌بندی مبدا/مقصد/ظرفیت/قیمت
- [ ] لیست رزروها + فیلتر وضعیت
- [ ] صفحه جزئیات رزرو با payments و tracking_code
- [ ] صفحه tracking با `GET /api/reservations/track/{tracking_code}`
- [ ] polling هوشمند + backoff + stop on unmount
- [ ] صفحه تاریخچه پرداخت‌های کاربر
- [ ] ثبت و نمایش payment requestها
- [ ] هندل دقیق خطاهای 400/401/403/404/429/500

---

## 11) نکته مهم معماری

- برای نیازهای فرانت در این دامنه، endpoint مستقلی از `movement` برای user عادی وجود ندارد.
- داده‌های حرکت/موقعیت برای فرانت از مسیرهای tracking در `reservations` ارائه می‌شود.
- endpointهای ادمینی عمداً از این سند حذف شده‌اند.
