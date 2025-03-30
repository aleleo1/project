import { type Signal, createSignal } from "solid-js";
const DEFAULT_RIF = new Date()


export const get_DEFAULT_INITIAL_STATE = () => {
  const DEFAULT_DATE = new Date()
  DEFAULT_DATE.setMonth(DEFAULT_DATE.getMonth() - 6)
  return [DEFAULT_DATE, 'q1', DEFAULT_RIF]
}

export const delay = (ms: any) => new Promise(res => setTimeout(res, ms));
export  const formatDate = (d: Date) => ((typeof d === 'string' ? d : d.toISOString()).replace('T', ' ').slice(0, 10)) 

export const dateMinus6 = (d: Date) => {d.setMonth(d.getMonth() - 6); return d;}

// Custom signal creator function
export function createQuerySignal(val: [string, Date, Date]) {
    const [getValue, setValue] = createSignal<string>(`?q=${val[0]}&data=${formatDate((val[1]))}&rif=${formatDate(val[2])}`);
    const [callable, setCallable] = createSignal<boolean>(true)
    // Custom getter that returns formatted string
    const querySignal = [
      () => {
        return getValue() ?? '';
      },
      
        // Custom setter that takes an array of strings
        (input: [string, Date, Date?]) => {
          const [q, dateInput, rif] = input;
          const formattedDate = formatDate(
            dateMinus6(dateInput ?? new Date())
          );
          const formattedRif = formatDate(rif ?? DEFAULT_RIF)
          setValue(`?q=${q}&data=${formattedDate}&rif=${formattedRif}`);
        },
        () => {return callable()},
        (input: boolean) => setCallable(input)
      
    ];
  
    return querySignal as  unknown as Signal<string>;
}

export function getParams (q: string) {
    const match = q.match(/(?:\?|)q=([^&]+)|(?:\?|&)data=([^&]+)/g)!;
    return match.map((m: string) => m.split('=')[1])
}
