"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import {
  gradingScaleSchema,
  GradingScaleSchema,
} from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createGradingScale, updateGradingScale } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const GradingScaleForm = ({
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
  } = useForm<GradingScaleSchema>({
    resolver: zodResolver(gradingScaleSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createGradingScale : updateGradingScale,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((data) => {
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Grade band has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a grade band" : "Update the grade band"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Grade (e.g. A1)"
          name="grade"
          defaultValue={data?.grade}
          register={register}
          error={errors?.grade}
        />
        <InputField
          label="Remark (e.g. Excellent)"
          name="remark"
          defaultValue={data?.remark}
          register={register}
          error={errors?.remark}
        />
        <InputField
          label="Min Score"
          name="minScore"
          type="number"
          defaultValue={data?.minScore}
          register={register}
          error={errors?.minScore}
        />
        <InputField
          label="Max Score"
          name="maxScore"
          type="number"
          defaultValue={data?.maxScore}
          register={register}
          error={errors?.maxScore}
        />
        <InputField
          label="Sort Order"
          name="order"
          type="number"
          defaultValue={data?.order}
          register={register}
          error={errors?.order}
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
        <span className="text-red-500">
          Something went wrong! (Min score must not exceed max score)
        </span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default GradingScaleForm;
