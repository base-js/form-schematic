import { SchemaCore } from "../types";
import createForm from "./createForm";

export const validate = <Schema extends SchemaCore>(
  schemas: Schema[],
  values: Record<any, any> = {},
  extraData: Record<any, any> = {},
) => {
  const form = createForm({ schemas, initialValues: values, extraData });

  return form.state.fieldsState.errors;
};

export default validate;
