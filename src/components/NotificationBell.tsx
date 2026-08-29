"use client";

import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
};

const NotificationBell = ({
  notifications,
}: {
  notifications: NotificationItem[];
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    router.refresh();
  };

  const handleClickItem = async (id: number) => {
    await markNotificationRead(id);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative"
        onClick={() => setOpen((o) => !o)}
      >
        <Image src="/announcement.png" alt="" width={20} height={20} />
        {unreadCount > 0 && (
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            {unreadCount}
          </div>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-500"
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 && (
            <p className="p-4 text-xs text-gray-400 text-center">
              No notifications yet.
            </p>
          )}
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              onClick={() => {
                setOpen(false);
                if (!n.read) handleClickItem(n.id);
              }}
              className={`block p-3 border-b border-gray-50 text-xs hover:bg-lamaSkyLight ${
                n.read ? "opacity-60" : "font-medium"
              }`}
            >
              <p className="text-sm">{n.title}</p>
              <p className="text-gray-500 mt-1">{n.message}</p>
              <p className="text-gray-300 mt-1">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(n.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
