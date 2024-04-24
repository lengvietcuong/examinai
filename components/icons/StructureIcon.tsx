import * as React from "react";

const StructureIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={800}
		height={800}
		viewBox="0 0 36 36"
		{...props}
	>
		<path
			d="M9.8 18.8h16.4v3.08h1.6V17.2h-9V14h-1.6v3.2h-9v4.68h1.6V18.8z"
			className="clr-i-outline clr-i-outline-path-1"
		/>
		<path
			d="M14 23H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2ZM4 31v-6h10v6Z"
			className="clr-i-outline clr-i-outline-path-2"
		/>
		<path
			d="M32 23H22a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Zm-10 8v-6h10v6Z"
			className="clr-i-outline clr-i-outline-path-3"
		/>
		<path
			d="M13 13h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H13a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm0-8h10v6H13Z"
			className="clr-i-outline clr-i-outline-path-4"
		/>
		<path fill="none" d="M0 0h36v36H0z" />
	</svg>
)
export default StructureIcon;
