import { useEffect, useRef } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'

const roomContainerStyle = 'h-full w-full overflow-hidden bg-black'

function ZegoRoom({ zegoConfig, sharedLinkUrl, onJoinRoom, onError }) {
  const containerRef = useRef(null)
  const zpRef = useRef(null)
  const initializedRef = useRef(false)
  const initTokenRef = useRef('')
  const onJoinRoomRef = useRef(onJoinRoom)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onJoinRoomRef.current = onJoinRoom
    onErrorRef.current = onError
  }, [onError, onJoinRoom])

  useEffect(() => {
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy()
        zpRef.current = null
      }
      initializedRef.current = false
      initTokenRef.current = ''
    }
  }, [])

  useEffect(() => {
    if (!zegoConfig?.app_id || !zegoConfig?.zego_token) {
      console.error('❌ Missing Zego config')
      return
    }
    if (!containerRef.current) {
      console.log('DUPLICATE BLOCKED')
      return
    }
    if (zpRef.current) {
      console.log('DUPLICATE BLOCKED')
      console.log('[conference] prevent duplicate init')
      return
    }
    if (initializedRef.current) {
      console.log('DUPLICATE BLOCKED')
      console.log('🚫 Zego already initialized')
      return
    }

    const appId = Number(zegoConfig.app_id)
    const zegoToken = typeof zegoConfig.zego_token === 'string' ? zegoConfig.zego_token.trim() : ''
    const roomId = typeof zegoConfig.room_id === 'string' ? zegoConfig.room_id : ''
    const userId = String(zegoConfig.user_id)
    const userName = zegoConfig.user_name || userId
    const sharedLink =
      typeof sharedLinkUrl === 'string' && sharedLinkUrl.trim()
        ? sharedLinkUrl.trim()
        : `${window.location.origin}${window.location.pathname}`
    if (!appId || !zegoToken || !roomId || !userId) {
      console.error('❌ Missing Zego config')
      return
    }

    try {
      console.log('APP_ID:', appId)
      console.log('ROOM_ID:', roomId)
      console.log('USER_ID:', userId)
      console.log('TOKEN (TRUNCATED):', zegoToken.slice(0, 20))

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(appId, zegoToken, roomId, userId, userName)
      initTokenRef.current = zegoToken
      initializedRef.current = true

      const zp = ZegoUIKitPrebuilt.create(kitToken)
      zpRef.current = zp
      console.log('ZEGO INIT')
      console.log('[conference] init once')
      console.log('JOIN CALLED')
      console.log('[conference] join once')

      zp.joinRoom({
        container: containerRef.current,
        roomID: roomId,
        userID: userId,
        userName,
        showPreJoinView: true,
        sharedLinks: [{ name: 'Conference Link', url: sharedLink }],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        onJoinRoom: () => {
          onJoinRoomRef.current?.()
        },
      })
    } catch (error) {
      initializedRef.current = false
      onErrorRef.current?.(error)
    }
  }, [sharedLinkUrl, zegoConfig?.app_id, zegoConfig?.zego_token, zegoConfig?.room_id, zegoConfig?.user_id, zegoConfig?.user_name])

  useEffect(() => {
    if (!initializedRef.current || !zpRef.current || !zegoConfig?.zego_token) return
    if (initTokenRef.current === zegoConfig.zego_token) return
    console.log('DUPLICATE BLOCKED')
    console.log('[conference] token change after init ignored')
  }, [zegoConfig?.zego_token])

  if (!zegoConfig?.zego_token || !zegoConfig?.app_id) return null

  return <div ref={containerRef} className={roomContainerStyle} />
}

export default ZegoRoom

