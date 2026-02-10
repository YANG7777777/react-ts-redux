import React from "react";
import { Form } from "antd";
import type { FormProps } from "antd";

interface CommonFormProps<T extends object> extends FormProps<T> {
  className?: string;
}

const CommonForm = <T extends object>({
  className,
  children,
  ...props
}: CommonFormProps<T>) => {
  const FormComponent = Form as React.ComponentType<FormProps<T>>;
  return (
    <FormComponent className={className} {...props}>
      {children}
    </FormComponent>
  );
};

export default CommonForm;
