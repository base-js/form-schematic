import {
  useEffect, useRef,
} from "react";
import createForm, { CreateFormProps, Form } from "../logic/createForm";
// import useUpdate from "./useUpdate";
import { SchemaCore } from "../types";
import useContainer from "./useContainer";

export const useForm = <Schema extends SchemaCore = SchemaCore>(props: CreateFormProps<Schema>) => {
  // const update = useUpdate();
  const _ctx = useRef<Form<Schema>>(null as any);

  if (!_ctx.current) {
    props.log?.("first init useForm");
    _ctx.current = createForm<Schema>(props);
  }

  useContainer({
    ctx: _ctx.current,
  });

  useEffect(() => {
    _ctx.current.reset({
      schemas: props.schemas,
      extraData: props.extraData,
      initialValues: props.initialValues,
    });
    props.log?.("update useForm");
    // update();
  }, [props.schemas, props.extraData, props.initialValues]);

  return {
    ctx: _ctx.current,
    formState: _ctx.current.state.formState,
    handleSubmit: _ctx.current.handleSubmit,
  };
};

export default useForm;
