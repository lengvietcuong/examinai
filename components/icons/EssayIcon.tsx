import * as React from "react";

const EssayIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={800}
		height={800}
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="m17.093 1.293-11.2 11.2a.99.99 0 0 0-.242.391l-1.6 4.8A1 1 0 0 0 5 19a1.014 1.014 0 0 0 .316-.051l4.8-1.6a1.006 1.006 0 0 0 .391-.242l11.2-11.2a1 1 0 0 0 0-1.414l-3.2-3.2a1 1 0 0 0-1.414 0ZM9.26 15.526l-2.679.893.893-2.679L17.8 3.414 19.586 5.2ZM3 21h17a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2Z" />
	</svg>
)
export default EssayIcon;