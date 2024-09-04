import * as React from "react";

const RobotIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={800}
		height={800}
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			d="M9 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM14 16a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
		/>
		<path
			fillRule="evenodd"
			d="M12 1a2 2 0 0 0-1 3.732V7H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V10a3 3 0 0 0-3-3h-5V4.732A2 2 0 0 0 12 1Zm-7 9a1 1 0 0 1 1-1h1.382l1.447 2.894A2 2 0 0 0 10.618 13h2.764a2 2 0 0 0 1.789-1.106L16.618 9H18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V10Zm8.382 1 1-2H9.618l1 2h2.764Z"
			clipRule="evenodd"
		/>
		<path
			d="M1 14a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1ZM22 15a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2Z"
		/>
	</svg>
)

export default RobotIcon;