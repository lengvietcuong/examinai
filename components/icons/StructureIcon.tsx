import * as React from "react";

const StructureIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={800}
		height={800}
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M12 7h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v1H5V2a1 1 0 0 0-2 0v18a1 1 0 0 0 1 1h7v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v1H5v-6h6v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v1H5V5h6v1a1 1 0 0 0 1 1Zm1 12h6v2h-6Zm0-8h6v2h-6Zm0-8h6v2h-6Z" />
	</svg>
)
export default StructureIcon;
