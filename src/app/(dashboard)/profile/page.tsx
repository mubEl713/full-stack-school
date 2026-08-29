import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

const ProfilePage = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;

  let record: {
    name?: string;
    surname?: string;
    username?: string;
    email?: string | null;
    phone?: string | null;
    address?: string;
    img?: string | null;
  } | null = null;

  if (role && user?.id) {
    switch (role) {
      case "admin":
        record = await prisma.admin.findUnique({ where: { id: user.id } });
        break;
      case "owner":
        record = await prisma.owner.findUnique({ where: { id: user.id } });
        break;
      case "accountant":
        record = await prisma.accountant.findUnique({ where: { id: user.id } });
        break;
      case "teacher":
        record = await prisma.teacher.findUnique({ where: { id: user.id } });
        break;
      case "student":
        record = await prisma.student.findUnique({ where: { id: user.id } });
        break;
      case "parent":
        record = await prisma.parent.findUnique({ where: { id: user.id } });
        break;
      default:
        break;
    }
  }

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    record?.username ||
    user?.username ||
    "—";

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold mb-4">My Profile</h1>
      <div className="flex items-center gap-4 mb-6">
        <Image
          src={record?.img || "/noAvatar.png"}
          alt=""
          width={64}
          height={64}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold">{displayName}</h2>
          <span className="text-sm text-gray-500 capitalize">{role}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-gray-400">Username</span>
          <span>{record?.username || user?.username || "—"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-400">Email</span>
          <span>
            {record?.email || user?.emailAddresses?.[0]?.emailAddress || "—"}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-400">Phone</span>
          <span>{record?.phone || "—"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-400">Address</span>
          <span>{record?.address || "—"}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
