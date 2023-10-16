import {
  useContext,
} from "react";
import { Form } from "../logic/createForm";
import { SchemaCore } from "../types";
import { FormContext } from "../contexts/FormContext";
import useSubscribe from "./useSubscribe";

export const useSupport = <Schema extends SchemaCore = SchemaCore>(props: {
  ctx: Form<Schema>
  log?: () => void;
}) => {
  const { ctx: context } = useContext(FormContext);
  const { ctx = context } = props;

  useSubscribe({
    ctx,
    getState() {
      return ctx.state.formStateSupport;
    },
    subject: "supports",
  });

  return {
    ctx,
    state: ctx.state.formStateSupport,
  };
};

export default useSupport;
