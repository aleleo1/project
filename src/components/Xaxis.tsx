import { Show } from "solid-js";

export default function Xaxis(props: any) {

    const formData = props.formData;
    const margin = { top: 40, right: 40, bottom: 40, left: 100 };

    const ploth = () => formData.height() - margin.top - margin.bottom
    const plotw = () => formData.width() - margin.left - margin.right

    return (
        <g transform={`translate(${margin.left},${ploth()})`} fill="none" font-size="10" font-family="sans-serif"
            text-anchor="middle">
            <path class="domain" stroke="currentColor" d={`M0,0H${plotw()}`}></path>
            {props.children}
        </g>

    );
}