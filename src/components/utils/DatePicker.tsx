import { useData } from "../../contexts/dataContext";
import { formatDate } from "../../utils";
import { useChart } from "../../contexts/chartContext";
import { onMount } from "solid-js";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

export default function DatePickers(p: any) {
    const { loadNewDataWithDate, date, rif } = useData()!.functions as any
    const id = useChart()!.constants!['id']

    let d1Instance: any;
    let d2Instance: any;

    onMount(() => {
        // Make sure any existing instances are destroyed first
        if (d1Instance) d1Instance.destroy();
        if (d2Instance) d2Instance.destroy();

        // Initialize with proper configurations
        d1Instance = flatpickr(`#${id}-d1`, {
            dateFormat: "Y-m-d",
            minDate: date(),
            maxDate: new Date(),
            defaultDate: rif(),
            inline: false,
            static: true,
            disableMobile: true
        });

        d2Instance = flatpickr(`#${id}-d2`, {
            dateFormat: "Y-m-d",
            minDate: new Date("1900-01-01"),
            maxDate: rif(),
            defaultDate: date(),
            inline: false,
            static: true,
            disableMobile: true
        });

        // Clean up any rogue SVG elements that might have been created
        const cleanupRogueSVG = () => {
            document.querySelectorAll('svg > g:empty + path').forEach(el => {
                const parent = el.parentElement;
                if (parent && parent.children.length <= 2) {
                    parent.remove();
                }
            });
        };

        // Run cleanup after a short delay to ensure everything has rendered
        setTimeout(cleanupRogueSVG, 100);
    });

    return (
        <>
            <div class="relative">
                <input
                    id={`${id}-d1`}
                    class="flatpickr-input border rounded px-2 py-1"
                    placeholder={formatDate(rif())}
                    onChange={(event: any) => {
                        const selectedDate = new Date(event.target.value);
                        if (event.target.value && selectedDate > new Date(date()) && selectedDate < new Date()) {
                            loadNewDataWithDate('rif', event.target.value);
                        } else {
                            event.target.value = rif();
                        }
                    }}
                />
            </div>

            <div class="relative">
                <input
                    id={`${id}-d2`}
                    class="flatpickr-input border rounded px-2 py-1"
                    placeholder={formatDate(date())}
                    onChange={(event: any) => {
                        const selectedDate = new Date(event.target.value);
                        if (event.target.value && selectedDate < new Date(rif())) {
                            loadNewDataWithDate('date', event.target.value);
                        } else {
                            event.target.value = date();
                        }
                    }}
                />
            </div>
        </>
    );
}