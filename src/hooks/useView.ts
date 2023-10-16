/* eslint-disable no-use-before-define */
import { useCallback, useContext } from "react";
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

  const state = ctx.getViewState<Value>(schema);

  return {
    state,
    ctx,
    getProp: useCallback(
      // eslint-disable-next-line no-undef
      <K extends keyof Schema["properties"]>(key: K): NonNullable<Schema["properties"][K]>["value"] => state.props?.[key] ?? schema.properties[key]?.value,
      [state, schema],
    ),
  };
};

export default useView;
