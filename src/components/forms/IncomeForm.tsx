"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { incomeSchema, IncomeSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createIncome, updateIncome } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const IncomeForm = ({
  type,
  data,
  setOpen,
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
  } = useForm<IncomeSchema>({
    resolver: zodResolver(incomeSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createIncome : updateIncome,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((data) => {
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Income has been ${type === "create" ? "recorded" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Record income" : "Update the income"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Source"
          name="source"
          defaultValue={data?.source}
          register={register}
          error={errors?.source}
        />
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
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
          label="Date"
          name="date"
          type="date"
          defaultValue={data?.date?.toISOString?.().split("T")[0]}
          register={register}
          error={errors?.date}
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

export default IncomeForm;
