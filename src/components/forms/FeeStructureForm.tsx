"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import {
  feeStructureSchema,
  FeeStructureSchema,
} from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createFeeStructure, updateFeeStructure } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FEE_CATEGORY_LABEL } from "@/lib/utils";

const TERMS = ["FIRST", "SECOND", "THIRD"];
const CATEGORIES = Object.keys(FEE_CATEGORY_LABEL) as Array<
  keyof typeof FEE_CATEGORY_LABEL
>;

const FeeStructureForm = ({
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
  } = useForm<FeeStructureSchema>({
    resolver: zodResolver(feeStructureSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createFeeStructure : updateFeeStructure,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((data) => {
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Fee structure has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { grades } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a fee structure" : "Update the fee structure"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Amount (₦)"
          name="amount"
          type="number"
          defaultValue={data?.amount}
          register={register}
          error={errors?.amount}
        />
        <InputField
          label="Session (e.g. 2025/2026)"
          name="session"
          defaultValue={data?.session}
          register={register}
          error={errors?.session}
        />
        <InputField
          label="Due Date"
          name="dueDate"
          type="date"
          defaultValue={data?.dueDate?.toISOString?.().split("T")[0]}
          register={register}
          error={errors?.dueDate}
        />
        <InputField
          label="Early Discount % (optional)"
          name="earlyDiscountPercent"
          type="number"
          defaultValue={data?.earlyDiscountPercent}
          register={register}
          error={errors?.earlyDiscountPercent}
        />
        <InputField
          label="Early Discount Deadline (optional)"
          name="earlyDiscountDeadline"
          type="date"
          defaultValue={data?.earlyDiscountDeadline?.toISOString?.().split("T")[0]}
          register={register}
          error={errors?.earlyDiscountDeadline}
        />
        <InputField
          label="Late Penalty % (optional)"
          name="latePenaltyPercent"
          type="number"
          defaultValue={data?.latePenaltyPercent}
          register={register}
          error={errors?.latePenaltyPercent}
        />
        <InputField
          label="Late Penalty Grace Days (optional)"
          name="latePenaltyGraceDays"
          type="number"
          defaultValue={data?.latePenaltyGraceDays}
          register={register}
          error={errors?.latePenaltyGraceDays}
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
          <label className="text-xs text-gray-500">Term</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("term")}
            defaultValue={data?.term}
          >
            {TERMS.map((term) => (
              <option value={term} key={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Category</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("category")}
            defaultValue={data?.category}
          >
            {CATEGORIES.map((cat) => (
              <option value={cat} key={cat}>
                {FEE_CATEGORY_LABEL[cat]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            {grades.map((grade: { id: number; name: string }) => (
              <option value={grade.id} key={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
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

export default FeeStructureForm;
