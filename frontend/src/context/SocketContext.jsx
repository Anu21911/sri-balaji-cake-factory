import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useOwnerAuth } from './OwnerAuthContext';
import { useCustomerAuth } from './CustomerAuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latestAlert, setLatestAlert] = useState(null);

  const { owner, token: ownerToken } = useOwnerAuth();
  const { customer, token: customerToken } = useCustomerAuth();

  // Web Audio API Synthesizer Chime for Instant Sound Alert
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.8);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.8);
    } catch (e) {
      console.warn('Web Audio chime playback not permitted yet:', e);
    }
  };

  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      // console.log('[Socket] Connected to server:', socketInstance.id);
      setIsConnected(true);

      if (ownerToken) {
        socketInstance.emit('join_owner_room');
      }
      if (customer?.id) {
        socketInstance.emit('join_customer_room', customer.id);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Owner Real-time events
    socketInstance.on('new_order_received', (data) => {
      playChime();
      setLatestAlert({
        type: 'new_order',
        title: '🔔 New Order Received!',
        message: `${data.order.customer.name} placed order #${data.order.orderNumber} for ₹${data.order.totalAmount}`,
        timestamp: new Date()
      });
    });

    socketInstance.on('new_custom_cake_request', (data) => {
      playChime();
      setLatestAlert({
        type: 'custom_cake',
        title: '🎂 New Custom Cake Idea!',
        message: `${data.request.customer.name} sent a custom design idea (${data.request.flavour}, ${data.request.weight})`,
        timestamp: new Date()
      });
    });

    socketInstance.on('order_cancelled', (data) => {
      playChime();
      setLatestAlert({
        type: 'order_cancelled',
        title: '⚠️ Order Cancelled',
        message: `Customer cancelled order #${data.orderNumber}`,
        timestamp: new Date()
      });
    });

    // Customer Real-time events
    socketInstance.on('order_status_updated', (data) => {
      playChime();
      setLatestAlert({
        type: 'customer_order_update',
        title: `Order Update: #${data.orderNumber}`,
        message: data.message || `Your order status changed to: ${data.status}`,
        timestamp: new Date()
      });
    });

    socketInstance.on('custom_cake_quote_ready', (data) => {
      playChime();
      setLatestAlert({
        type: 'customer_quote_ready',
        title: `Price Quote Ready: ${data.cakeName}`,
        message: `Owner quoted ₹${data.quotedPrice}. Click to review and confirm!`,
        timestamp: new Date()
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [ownerToken, customer?.id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        soundEnabled,
        setSoundEnabled,
        playChime,
        latestAlert,
        clearLatestAlert: () => setLatestAlert(null)
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
