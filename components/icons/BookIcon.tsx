import * as React from "react";

const BookIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={800}
		height={800}
		fill="none"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			fillRule="evenodd"
			d="M19 23H7c-2.725 0-5-2.294-5-5V6a5 5 0 0 1 5-5h12a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3ZM7 3a3 3 0 0 0-3 3v9c.836-.628 1.874-1 3-1h12c.35 0 .687.06 1 .17V4a1 1 0 0 0-1-1h-1v6a1 1 0 0 1-1.555.832L14 8.202l-2.445 1.63A1 1 0 0 1 10 9V3H7Zm5 0h4v4.131l-1.445-.963a1 1 0 0 0-1.11 0L12 7.131V3Zm7 13a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H7c-1.487 0-2.959-1.084-2.959-2.5C4.041 17.053 5.513 16 7 16h12Z"
			clipRule="evenodd"
		/>
	</svg>
)
export default BookIcon;
