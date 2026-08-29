export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/owner(.*)": ["owner"],
  "/accountant(.*)": ["accountant"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/list/teachers": ["admin", "owner", "teacher"],
  "/list/students": ["admin", "owner", "teacher"],
  "/list/parents": ["admin", "owner", "teacher"],
  "/list/owners": ["admin"],
  "/list/accountants": ["admin"],
  "/list/subjects": ["admin", "owner"],
  "/list/classes": ["admin", "owner", "teacher"],
  "/list/lessons": ["admin", "owner", "teacher"],
  "/list/exams": ["admin", "owner", "teacher", "student", "parent"],
  "/list/assignments": ["admin", "owner", "teacher", "student", "parent"],
  "/list/results": ["admin", "owner", "teacher", "student", "parent"],
  "/list/attendance": ["admin", "owner", "teacher", "student", "parent"],
  "/list/events": ["admin", "owner", "teacher", "student", "parent"],
  "/list/announcements": ["admin", "owner", "teacher", "student", "parent"],
  "/accounting(.*)": ["admin", "owner", "accountant"],
  "/list/fee-structures": ["admin", "owner", "accountant"],
  "/list/fee-payments": ["admin", "owner", "accountant"],
  "/list/expenses": ["admin", "owner", "accountant"],
  "/list/income": ["admin", "owner", "accountant"],
  "/list/audit-log": ["admin", "owner"],
  "/list/grading-scale": ["admin"],
  "/profile": ["admin", "owner", "accountant", "teacher", "student", "parent"],
};