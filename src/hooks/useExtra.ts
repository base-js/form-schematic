import {
  useContext,
} from "react";
import { Form } from "../logic/createForm";
import { FormContext } from "../contexts/FormContext";
import useSubscribe from "./useSubscribe";
import { SchemaCore } from "../types";

export const useExtra = <Schema extends SchemaCore = SchemaCore, Value = any>(props: {
  defaultValue?: any;
  ctx?: Form<Schema>;
  name: string;
  log?: () => void;
}) => {
  const { ctx: context } = useContext(FormContext);
  const { ctx = context, name } = props;

  useSubscribe({
    ctx,
    subject: "extras",
    getState() {
      return ctx.getExtra(name);
    },
  });

  return {
    value: ctx.getExtra(name) as Value,
    ctx,
  };
};

export default useExtra;
