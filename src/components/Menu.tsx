import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "owner", "accountant", "teacher", "student", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "owner", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "owner", "teacher"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "owner", "teacher"],
      },
      {
        icon: "/parent.png",
        label: "Owners",
        href: "/list/owners",
        visible: ["admin"],
      },
      {
        icon: "/parent.png",
        label: "Accountants",
        href: "/list/accountants",
        visible: ["admin"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin", "owner"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "owner", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "owner", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "owner", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "owner", "teacher", "student", "parent"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["admin", "owner", "teacher", "student", "parent"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "owner", "teacher", "student", "parent"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "owner", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "owner", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "ACCOUNTING",
    items: [
      {
        icon: "/finance.png",
        label: "Dashboard",
        href: "/accounting",
        visible: ["admin", "owner", "accountant"],
      },
      {
        icon: "/finance.png",
        label: "Fee Structures",
        href: "/list/fee-structures",
        visible: ["admin", "owner", "accountant"],
      },
      {
        icon: "/finance.png",
        label: "Invoices",
        href: "/list/invoices",
        visible: ["admin", "owner", "accountant", "teacher"],
      },
      {
        icon: "/finance.png",
        label: "Fee Payments",
        href: "/list/fee-payments",
        visible: ["admin", "owner", "accountant"],
      },
      {
        icon: "/finance.png",
        label: "Waivers",
        href: "/list/waivers",
        visible: ["admin", "owner", "accountant"],
      },
      {
        icon: "/finance.png",
        label: "Refunds",
        href: "/list/refunds",
        visible: ["admin", "owner", "accountant"],
      },
      {
        icon: "/finance.png",
        label: "Expenses",
        href: "/list/expenses",
        visible: ["admin", "owner", "accountant"],
      },
      {
        icon: "/finance.png",
        label: "Income",
        href: "/list/income",
        visible: ["admin", "owner", "accountant"],
      },
      {
        icon: "/result.png",
        label: "Grading Scale",
        href: "/list/grading-scale",
        visible: ["admin"],
      },
      {
        icon: "/setting.png",
        label: "Auditing",
        href: "/list/audit-log",
        visible: ["admin", "owner"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "owner", "accountant", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
      <SignOutButton>
        <button className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight w-full">
          <Image src="/logout.png" alt="" width={20} height={20} />
          <span className="hidden lg:block">Logout</span>
        </button>
      </SignOutButton>
    </div>
  );
};

export default Menu;
