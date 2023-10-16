import { useContext } from "react";
import { Form } from "../logic/createForm";
import { FormContext } from "../contexts/FormContext";
import { SchemaCore } from "../types";
import useSubscribe from "./useSubscribe";

export const useContainer = <Schema extends SchemaCore = SchemaCore>(props: {
  ctx?: Form<Schema>;
  log?: () => void;
}) => {
  const { ctx: context } = useContext(FormContext);
  const { ctx = context } = props as { ctx: Form<Schema> };

  useSubscribe({
    ctx,
    subject: "containers",
  });

  return {
    ctx,
    formState: ctx.state.formState,
  };
};

export default useContainer;
