import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { Form } from "../logic/createForm";
import { SchemaCore } from "../types";
import { FormContext } from "../contexts/FormContext";
import generateId from "../utils/generateId";
import useSubscribe from "./useSubscribe";

// eslint-disable-next-line no-use-before-define
export const useField = <Schema extends SchemaCore>(props: {
  ctx?: Form<Schema>;
  schema: Schema;
  // eslint-disable-next-line no-unused-vars
  log?: () => void;
}) => {
  const { ctx: context } = useContext(FormContext);
  const { ctx = context, schema } = props;
  const _ref = useRef<any>();

  const identity = useMemo(() => schema.config?.name || schema.id || generateId(), [schema]);

  useSubscribe({
    ctx,
    getState() {
      return ctx.getFieldState(schema);
    },
    subject: "fields",
  });

  useSubscribe({
    ctx,
    subject: "containers",
  });

  useEffect(() => {
    ctx.state.fieldsRef[identity] = _ref;
    return () => {
      delete ctx.state.fieldsRef[identity];
    };
  }, [identity]);

  return {
    state: ctx.getFieldState<
      Schema["config"]["defaultValue"], { [K in keyof Schema["properties"]]?: NonNullable<Schema["properties"][K]>["value"] }
    >(schema),
    ctx,
    formState: ctx.state.formState,
    ref: _ref,
    onChange: useCallback(
      (arg: any) => {
        if (typeof arg === "function") {
          ctx.setValue(identity, arg(ctx.state.fieldsState.values));
        } else {
          ctx.setValue(identity, arg);
        }
      },
      [identity, ctx],
    ),
    onBlur: useCallback(
      () => ctx.updateTouch(identity),
      [identity, ctx],
    ),
  };
};

export default useField;

// const x = () => {
//   const ctx = useForm<SchemaDefault>({
//     initialValues: {},
//     schemas: [],
//     extraData: {},
//   });
//   const res = useField<SchemaFieldArrayDefault>({
//     schema: {

//     } as any,
//   });
//   type x = NonNullable<SchemaFieldArrayDefault['properties']['disabled']>['value']
//   res.field.props.

//   return null;
// };

// console.log(x);
