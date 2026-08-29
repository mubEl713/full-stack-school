"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { refundSchema, RefundSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createRefund, updateRefund } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const RefundForm = ({
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
  } = useForm<RefundSchema>({
    resolver: zodResolver(refundSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createRefund : updateRefund,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((data) => {
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Refund has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { payments } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Record a refund" : "Update the refund"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Amount (₦)"
          name="amount"
          type="number"
          defaultValue={data?.amount}
          register={register}
          error={errors?.amount}
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
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Original Payment</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("feePaymentId")}
            defaultValue={data?.feePaymentId}
          >
            {payments.map(
              (payment: {
                id: number;
                amount: number;
                student: { name: string; surname: string };
              }) => (
                <option value={payment.id} key={payment.id}>
                  {payment.student.name} {payment.student.surname} — ₦
                  {payment.amount.toLocaleString()}
                </option>
              )
            )}
          </select>
          {errors.feePaymentId?.message && (
            <p className="text-xs text-red-400">
              {errors.feePaymentId.message.toString()}
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

export default RefundForm;
