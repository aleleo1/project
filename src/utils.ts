import { type Accessor, type Setter, type Signal, createSignal } from "solid-js";

export const delay = (ms: any) => new Promise(res => setTimeout(res, ms));
export  const formatDate = (d: Date) => ((typeof d === 'string' ? d : d.toISOString()).replace('T', ' ').slice(0, 10)) 

// Custom signal creator function
export function createQuerySignal(val: [string, Date]) {
    const [getValue, setValue] = createSignal<string>(`?q=${val[0]}&data=${formatDate((val[1]))}`);
    const [callable, setCallable] = createSignal<boolean>(true)
    // Custom getter that returns formatted string
    const querySignal = [
      () => {
        return getValue() ?? '';
      },
      
        // Custom setter that takes an array of strings
        (input: [string, Date]) => {
          const [q, dateInput] = input;
          const dateMinus6 = dateInput ?? new Date()
          dateMinus6.setMonth(dateMinus6.getMonth() - 6)
          const formattedDate = formatDate(
            dateMinus6
          );
          setValue(`?q=${q}&data=${formattedDate}`);
        },
        callable,
        setCallable
      
    ];
  
    return querySignal as  unknown as Signal<string>;
}

export function getParams (q: string) {
    const match = q.match(/(?:\?|)q=([^&]+)|(?:\?|&)data=([^&]+)/g)!;
    return match.map((m: string) => m.split('=')[1])
}
