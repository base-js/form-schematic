import { useContext } from "react";
import { SchemaCore } from "../types";
import { Form } from "../logic/createForm";
import { FormContext } from "../contexts/FormContext";
import useSubscribe from "./useSubscribe";

export const useView = <Schema extends SchemaCore = SchemaCore, Value = any>(props: {
  ctx?: Form<Schema>;
  schema: Schema;
  log?: () => void;
}) => {
  const { ctx: context } = useContext(FormContext);
  const { ctx = context, schema } = props;

  useSubscribe({
    ctx,
    subject: "fields",
    getState() {
      return ctx.getViewState(schema);
    },
  });

  return {
    state: ctx.getViewState<
      Value, { [K in keyof Schema["properties"]]?: NonNullable<Schema["properties"][K]>["value"] }
    >(schema),
    ctx,
  };
};

export default useView;
