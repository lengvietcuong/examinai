import * as React from "react";

const CheckListIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={800}
		height={800}
		viewBox="0 0 24 24"
		{...props}
	>
		<circle cx={6} cy={12} r={2} />
		<path
			d="m8.708 5.717-1.954 1.96c-.25.243-.61.37-.958.307C5.5 7.93 4.64 7.327 4.458 7.21a1 1 0 0 1 1.08-1.683l.32.2 1.43-1.435c.39-.39 1.03-.39 1.42 0 .39.392.39 1.034 0 1.425zM20 7c0 .55-.45 1-1 1h-8.01a1 1 0 0 1 0-2H19c.55 0 1 .45 1 1z"
		/>
		<circle cx={6} cy={18} r={2} />
		<path
			d="M20 13c0 .55-.45 1-1 1h-8.01a1 1 0 0 1 0-2H19c.55 0 1 .45 1 1zm0 6c0 .55-.45 1-1 1h-8.01a1 1 0 0 1 0-2H19c.55 0 1 .45 1 1z"
		/>
		<path
			d="M22 0H2C.9 0 0 .9 0 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 21.5a.5.5 0 0 1-.5.5h-19a.5.5 0 0 1-.5-.5v-19a.5.5 0 0 1 .5-.5h19a.5.5 0 0 1 .5.5v19z"
		/>
	</svg>
)
export default CheckListIcon;
