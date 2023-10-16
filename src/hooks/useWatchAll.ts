import {
  useContext,
} from "react";
import { Form } from "../logic/createForm";
import { FormContext } from "../contexts/FormContext";
import useSubscribe from "./useSubscribe";
import { SchemaCore } from "../types";

export const useWatchAll = <Schema extends SchemaCore = SchemaCore>(props: {
  ctx?: Form<Schema>;
  log?: () => void;
}) => {
  const { ctx: context } = useContext(FormContext);
  const { ctx = context } = props;

  useSubscribe({
    ctx,
    subject: "fields",
  });

  return {
    values: ctx.state.fieldsState.values,
    ctx,
  };
};

export default useWatchAll;
