import { useContext, useEffect } from "react";
import cloneDeep from "lodash.clonedeep";
import type { Form, Subject } from "../logic/createForm";
import { FormContext } from "../contexts/FormContext";
import useUpdate from "./useUpdate";
import { SchemaCore } from "../types";

const useSubscribe = <Schema extends SchemaCore = SchemaCore>(props: {
  subject: keyof Subject;
  ctx?: Form<Schema>;
  active?: boolean;
  getState?: () => any;
}) => {
  const update = useUpdate();
  const { ctx: context } = useContext(FormContext);
  const {
    ctx = context,
    active = true,
    subject = "fields",
    getState,
  } = props;

  useEffect(() => {
    if (!active) return;

    let prevState = cloneDeep(getState?.());
    const unsubscribe = ctx.subscribe(subject, () => {
      if (!getState?.()) {
        update();
      } else if (JSON.stringify(prevState) !== JSON.stringify(getState())) {
        prevState = cloneDeep(getState());
        update();
      }
    });
    // eslint-disable-next-line consistent-return
    return unsubscribe;
  }, [active, ctx]);
};

export default useSubscribe;
