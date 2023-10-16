import {
  useContext,
} from "react";
import { Form } from "../logic/createForm";
import { FormContext } from "../contexts/FormContext";
import useSubscribe from "./useSubscribe";
import { SchemaCore } from "../types";

export const useWatch = <Schema extends SchemaCore = SchemaCore, Value = any>(props: {
  defaultValue?: Value;
  ctx?: Form<Schema>;
  name: string;
  log?: () => void;
}) => {
  const { ctx: context } = useContext(FormContext);
  const { ctx = context, name } = props;

  useSubscribe({
    ctx,
    subject: "fields",
    getState() {
      return ctx.getValue(name);
    },
  });

  return {
    value: ctx.getValue(name) as Value ?? props.defaultValue,
    ctx,
  };
};

export default useWatch;
