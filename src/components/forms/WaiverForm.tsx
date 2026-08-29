"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { waiverSchema, WaiverSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createWaiver, updateWaiver } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const TYPES = ["SCHOLARSHIP", "STAFF_DISCOUNT", "BURSARY", "OTHER"];

const WaiverForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaiverSchema>({
    resolver: zodResolver(waiverSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createWaiver : updateWaiver,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((data) => {
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Waiver has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a waiver" : "Update the waiver"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Session (e.g. 2025/2026)"
          name="session"
          defaultValue={data?.session}
          register={register}
          error={errors?.session}
        />
        <InputField
          label="Percent (optional)"
          name="percent"
          type="number"
          defaultValue={data?.percent}
          register={register}
          error={errors?.percent}
        />
        <InputField
          label="Fixed Amount (optional)"
          name="fixedAmount"
          type="number"
          defaultValue={data?.fixedAmount}
          register={register}
          error={errors?.fixedAmount}
        />
        <InputField
          label="Reason"
          name="reason"
          defaultValue={data?.reason}
          register={register}
          error={errors?.reason}
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("type")}
            defaultValue={data?.type}
          >
            {TYPES.map((t) => (
              <option value={t} key={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
            defaultValue={data?.studentId}
          >
            {students.map(
              (student: { id: string; name: string; surname: string }) => (
                <option value={student.id} key={student.id}>
                  {student.name + " " + student.surname}
                </option>
              )
            )}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default WaiverForm;
