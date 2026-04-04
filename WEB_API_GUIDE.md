## راهنمای کامل API و فلوهای وب (واگن، رزرویشن، استیشن‌ها، ترکینگ، پیمنت)

این سند، براساس کدهای موجود در اپ فعلی (Flutter) جمع‌آوری شده و همه اندپوینت‌ها، بادی‌های درخواست/پاسخ (JSON)، و ترتیب منطق صفحات لازم برای پیاده‌سازی نسخه وب را توضیح می‌دهد. URLهای زیر همگی به `ApiConfig.baseUrl` متکی‌اند. نمونه‌ها مطابق ساختار واقعی مصرف‌شده در اپ نوشته شده‌اند.


### احراز هویت (خلاصه لازم برای این بخش‌ها)
- ورود: POST `/api/auth/login/`  Body: { email, password }  → ذخیره `access`, `refresh` یا `tokens:{access,refresh}`
- پروفایل من: GET `/api/auth/me/`  → شامل نقش‌ها و وضعیت ورود

در همه اندپوینت‌های غیرعمومی باید هدر Authorization با Bearer Token ارسال شود:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
Accept: application/json
```


## 1) استیشن‌ها (Stations)

- GET `/api/core/stations/`
  - توضیح: فهرست استیشن‌ها با شمارش مقاصد مجاز و موجودی کلی واگن.
  - Response (نمونه هر آیتم):
  ```json
  {
    "id": 12,
    "name": "Kabul Central",
    "code": "KBL",
    "country": "Afghanistan",
    "province_or_state": "Kabul",
    "city": "Kabul",
    "description": "Main hub",
    "allowed_destinations_count": 7,
    "total_available_wagons": 24
  }
  ```

- GET `/api/core/stations/{id}/`
  - توضیح: جزئیات یک استیشن، به‌همراه مقاصد مجاز و موجودی واگن‌ها.
  - Response (نمونه):
  ```json
  {
    "id": 12,
    "name": "Kabul Central",
    "code": "KBL",
    "country": "Afghanistan",
    "province_or_state": "Kabul",
    "city": "Kabul",
    "description": "Main hub",
    "allowed_destinations": [
      { "id": 31, "name": "Mazar", "code": "MZR", "country": "Afghanistan", "province_or_state": "Balkh", "city": "Mazar-i-Sharif" }
    ],
    "wagon_availability": {
      "wagon_availability_by_type": [
        { "wagon_type": 3, "wagon_type_name": "Box", "available": 8 },
        { "wagon_type": 5, "wagon_type_name": "Tank", "available": 2 }
      ]
    }
  }
  ```

- GET `/api/core/wagon-types/{wagonTypeId}/?origin_station={originId}&destination_station={destId}`
  - توضیح: جزئیات نوع واگن و قیمت برای مسیر انتخاب‌شده.
  - Query پارامترها: `origin_station` (اختیاری ولی در اپ استفاده می‌شود)، `destination_station` (اختیاری ولی در اپ استفاده می‌شود)
  - Response (نمونه حداقلی مطابق مصرف UI):
  ```json
  {
    "id": 3,
    "name": "Box",
    "capacity_tons": 60,
    "pricing": {
      "base_price_usd": 1200,
      "base_price_afn": 96000,
      "total_price_usd": 1200,
      "total_price_afn": 96000
    }
  }
  ```


## 2) واگن‌ها و دسترسی (Availability)

- GET `/api/wagons/available?origin_station={id}&destination_station={id}&wagon_type={id}`
  - توضیح: دریافت واگن‌های در دسترس با فیلترها. در اپ فعلی بیشتر از مسیر استیشن‌ها + نوع واگن استفاده می‌شود؛ اگر بک‌اند این مسیر را فعال دارد، برای وب نیز قابل استفاده است.
  - Response (نمونه هر آیتم):
  ```json
  {
    "id": "WGN-20240301-001",
    "route": "KBL → MZR",
    "origin": "KBL",
    "destination": "MZR",
    "total_capacity": 60,
    "reserved": 20,
    "available": 40,
    "date": "2026-03-29",
    "cargo_type": "General",
    "price": 1200.0
  }
  ```

توجه: در فلو رزرویشن فعلی، وب می‌تواند صرفاً از داده‌های استیشن/نوع‌واگن برای قیمت و ظرفیت استفاده کند و الزامی به فراخوانی مستقیم این اندپوینت نیست مگر برای نمایش دقیق موجودی تک‌واگن‌ها.


## 3) رزرویشن (Reservations)

- ایجاد رزرو: POST `/api/reservations/reservations/`
  - Body (مطابق فرم ایجاد در اپ):
  ```json
  {
    "origin_station": 12,
    "destination_station": 31,
    "wagon_type": 3,
    "number_of_wagons": 2,
    "cargo_description": "Food supplies",
    "cargo_weight": 45.5,
    "special_requirements": "Keep dry"
  }
  ```
  - Response (نمونه حداقلی، مقادیر بسته به بک‌اند):
  ```json
  {
    "id": 145,
    "message": "Reservation created",
    "status": "pending",
    "status_display": "Pending Approval",
    "origin_station_name": "Kabul Central",
    "destination_station_name": "Mazar",
    "wagon_type_name": "Box",
    "number_of_wagons": 2,
    "calculated_price_usd": 2400.0,
    "calculated_price_afn": 192000.0,
    "tracking_code": { "code": "TRK-XYZ-00123" }
  }
  ```
  - نکته مهم (فلو پرداخت): پس از ساخت رزرویشن، اپ بلافاصله درخواست پرداخت ایجاد می‌کند (بخش پیمنت پایین).

- فهرست رزروهای من: GET `/api/reservations/reservations/`
  - Query اختیاری: `status=pending|approved|...`
  - Response (نمونه آیتم‌ها؛ در UI فیلدهای زیر مصرف می‌شوند):
  ```json
  [{
    "id": 145,
    "origin_station_name": "Kabul Central",
    "destination_station_name": "Mazar",
    "status": "pending",
    "status_display": "Pending Approval",
    "number_of_wagons": 2,
    "calculated_price_usd": 2400.0,
    "created_at": "2026-03-29T09:21:00Z",
    "tracking_code": { "code": "TRK-XYZ-00123" }
  }]
  ```

- جزئیات رزرو: GET `/api/reservations/reservations/{id}/`
  - Response (نمونه مطابق صفحه جزئیات):
  ```json
  {
    "id": 145,
    "origin_station_name": "Kabul Central",
    "destination_station_name": "Mazar",
    "status": "approved",
    "status_display": "Approved",
    "wagon_type_name": "Box",
    "number_of_wagons": 2,

    "calculated_price_usd": 2400.0,
    "calculated_price_afn": 192000.0,

    "total_paid_usd": 1200.0,
    "total_paid_afn": 96000.0,
    "remaining_amount_usd": 1200.0,
    "remaining_amount_afn": 96000.0,
    "financially_settled": false,

    "tracking_code": { "code": "TRK-XYZ-00123" },

    "payments": [
      {
        "id": 501,
        "installment_number": 1,
        "status": "paid",
        "payment_method": "bank",
        "amount_paid": 1200.0,
        "paid_currency": "USD",
        "amount_usd": 1200.0,
        "amount_afn": 96000.0,
        "remaining_amount": 1200.0
      }
    ],

    "assigned_wagons": [
      { "code": "WGN-20240301-001" },
      { "code": "WGN-20240301-002" }
    ]
  }
  ```


## 4) ترکینگ (Tracking)

دو مسیر در کد دیده می‌شود؛ مسیر اصلی فعلی بر پایه کُد ترکینگ رزرویشن است:

- GET `/api/reservations/track/{trackingCode}/`
  - توضیح: اطلاعات سفر و مکان فعلی بر اساس کد ترکینگ.
  - Response (نمونه مطابق مدل `CargoTracking`):
  ```json
  {
    "tracking_code": "TRK-XYZ-00123",
    "journey": {
      "from": "Kabul Central",
      "from_code": "KBL",
      "from_latitude": 34.5553,
      "from_longitude": 69.2075,
      "to": "Mazar",
      "to_code": "MZR",
      "to_latitude": 36.7090,
      "to_longitude": 67.1109
    },
    "movement": {
      "identifier": "MV-8841",
      "status": "In Transit",
      "estimated_arrival": "2026-03-30T15:00:00Z",
      "progress_percentage": 42.5
    },
    "current_position": {
      "latitude": 35.50,
      "longitude": 68.10,
      "location_name": "On route",
      "timestamp": "2026-03-29T10:15:00Z",
      "speed": 60.0,
      "heading": 75.0
    },
    "message": null
  }
  ```

همچنین اندپوینت دیگری نیز وجود دارد (ممکن است برای کارگوهای کاربر استفاده شود):

- GET `/api/cargo/tracking/{cargoId}`
- GET `/api/cargo/user`


## 5) پیمنت (Payment)

الگوی فعلی اپ پس از ایجاد رزرویشن، یک درخواست پرداخت ارسال می‌کند:

- ایجاد درخواست پرداخت برای رزرو: POST `/api/payments/request/`
  - Body:
  ```json
  { "reservation_id": 145 }
  ```
  - Response: وابسته به بک‌اند؛ در UI صرفاً موفقیت/شکست اطلاع‌رسانی می‌شود.

اندپوینت‌های عمومی‌تر مالی (در صورت نیاز وب):

- GET `/api/account/balance`  → مانده حساب کاربر
- POST `/api/account/topup`   Body: { ... }  → شارژ حساب (جزییات به بک‌اند وابسته است)

توجه: متدی به نام `createPayment` نیز در کد وجود دارد: POST `/api/payment/create` که در فلو فعلی صفحات استفاده نشده است. اگر در وب نیاز به ایجاد پرداخت مستقیم باشد، از تیم بک‌اند درباره Body دقیق این مسیر سؤال شود.


## 6) فلو و منطق صفحات برای وب

- صفحه فهرست استیشن‌ها
  - فراخوانی: GET `/api/core/stations/`
  - نمایش هر استیشن (نام، کُد، شهر، تعداد مقاصد مجاز، موجودی واگن)
  - اکشن: رفتن به جزئیات استیشن

- صفحه جزئیات استیشن
  - فراخوانی: GET `/api/core/stations/{id}/`
  - نمایش اطلاعات استیشن + لیست مقاصد مجاز (`allowed_destinations`) و موجودی واگن‌ها (`wagon_availability_by_type`)
  - انتخاب مقصد و نوع واگن
  - فراخوانی قیمت نوع واگن برای مسیر: GET `/api/core/wagon-types/{wagonTypeId}/?origin_station={originId}&destination_station={destId}`
  - دکمه ادامه به ایجاد رزرو

- صفحه ایجاد رزرویشن
  - فرم شامل: مقصد، نوع واگن، تعداد واگن، توضیح بار، وزن (تن)، نیازمندی‌های ویژه (اختیاری)
  - ایجاد: POST `/api/reservations/reservations/` (Body بالا)
  - در صورت موفقیت: نمایش پیام، و سپس
    - ارسال پرداخت: POST `/api/payments/request/` با `reservation_id` از پاسخ
    - هدایت به صفحه موفقیت/جزئیات رزرو یا فهرست رزروها

- صفحه فهرست رزروها
  - فراخوانی: GET `/api/reservations/reservations/` (اختیاری: `?status=...`)
  - نمایش کارت هر رزرو: مسیر، وضعیت، تعداد واگن، قیمت، تاریخ ایجاد، کُد ترکینگ (در صورت وجود)
  - اکشن: رفتن به جزئیات رزرو

- صفحه جزئیات رزرو
  - فراخوانی: GET `/api/reservations/reservations/{id}/`
  - نمایش خلاصه رزرو، قیمت‌ها، پرداخت‌ها، باقیمانده، وضعیت تسویه، واگن‌های تخصیص‌یافته، کُد ترکینگ
  - اکشن‌های احتمالی: کپی کُد ترکینگ، رفرش اطلاعات

- صفحه ترکینگ
  - ورودی: `trackingCode` (از جزئیات رزرو یا ورودی کاربر)
  - فراخوانی: GET `/api/reservations/track/{trackingCode}/`
  - نمایش نقشه/مسیر، موقعیت فعلی، درصد پیشرفت، ETA و وضعیت

- صفحه/بخش پرداخت
  - تریگر اصلی: بعد از ایجاد رزرو POST `/api/payments/request/`
  - برای مانده حساب/شارژ: GET `/api/account/balance`، POST `/api/account/topup`


## 7) قراردادهای خطا و نکات پیاده‌سازی وب

- بدنه خطاها ممکن است یکی از این‌ها باشد: `non_field_errors`, `detail`, `error`, `message`، یا کلید اول map. در وب، پیام خطا را به همین ترتیب استخراج کنید.
- برخی پاسخ‌ها ممکن است داده را در شیء تو در تو قرار دهند، مانند `{ data: {...} }` یا `{ reservation: {...} }`؛ در وب، در صورت وجود این ساختارها، داده داخلی را merge کنید تا به کلیدهای سطح بالا دسترسی یکنواخت داشته باشید.
- برخی فیلدها ممکن است غیرفعال یا null باشند؛ در UI حالت‌های تهی را مدیریت کنید.
- همه درخواست‌های غیرعمومی نیازمند Header `Authorization: Bearer <TOKEN>` هستند.


## 8) چک‌لیست یکپارچه‌سازی برای تیم وب

- احراز هویت: پیاده‌سازی ورود و ذخیره `access`/`refresh` (و رفرش توکن در صورت نیاز)
- استیشن‌ها:
  - فهرست (`/api/core/stations/`)
  - جزئیات (`/api/core/stations/{id}/`)
  - قیمت نوع واگن برای مسیر (`/api/core/wagon-types/{id}/?...`)
- رزرویشن:
  - ایجاد (`POST /api/reservations/reservations/`)
  - فهرست (`GET /api/reservations/reservations/`)
  - جزئیات (`GET /api/reservations/reservations/{id}/`)
- ترکینگ:
  - بر اساس کد (`GET /api/reservations/track/{trackingCode}/`)
- پرداخت:
  - درخواست پرداخت برای رزرو (`POST /api/payments/request/`)
  - مانده حساب (`GET /api/account/balance`) و شارژ (`POST /api/account/topup`) در صورت نیاز


## 9) نمونه هدرها و فراخوانی‌ها (Front-end وب)

```http
GET /api/core/stations/ HTTP/1.1
Host: <BASE_API_HOST>
Authorization: Bearer <ACCESS_TOKEN>
Accept: application/json
```

```http
GET /api/core/wagon-types/3/?origin_station=12&destination_station=31 HTTP/1.1
Host: <BASE_API_HOST>
Authorization: Bearer <ACCESS_TOKEN>
Accept: application/json
```

```http
POST /api/reservations/reservations/ HTTP/1.1
Host: <BASE_API_HOST>
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "origin_station": 12,
  "destination_station": 31,
  "wagon_type": 3,
  "number_of_wagons": 2,
  "cargo_description": "Food supplies",
  "cargo_weight": 45.5,
  "special_requirements": "Keep dry"
}
```

```http
POST /api/payments/request/ HTTP/1.1
Host: <BASE_API_HOST>
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{ "reservation_id": 145 }
```

```http
GET /api/reservations/track/TRK-XYZ-00123/ HTTP/1.1
Host: <BASE_API_HOST>
Authorization: Bearer <ACCESS_TOKEN>
Accept: application/json
```


### نکات نهایی
- اگر بک‌اند برخی مسیرها را کمی متفاوت برگرداند (مثلاً `tokens` یا `access/refresh` سطح بالا)، لایه سازگارساز سمت وب اضافه کنید.
- برای `createPayment` یا شارژ حساب، اگر فیلدهای دقیق لازم باشند، از بک‌اند سؤال شود. فلو اصلی ما با `payments/request/` کار می‌کند.
- آدرس واقعی `ApiConfig.baseUrl` را در وب بر اساس محیط (Production/Dev) تنظیم کنید.

