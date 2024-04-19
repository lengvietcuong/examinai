import * as React from "react";

const HamburgerMenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={800}
		height={800}
		viewBox="0 0 48 48"
		{...props}
	>
		<title>{"menu-hamburger"}</title>
		<g data-name="Layer 2">
			<path fill="none" d="M0 0h48v48H0z" data-name="invisible box" />
			<g data-name="icons Q2">
				<path d="M42 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2 2 2 0 0 1 2-2h32a2 2 0 0 1 2 2ZM42 24a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2 2 2 0 0 1 2-2h32a2 2 0 0 1 2 2ZM42 36a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2 2 2 0 0 1 2-2h32a2 2 0 0 1 2 2Z" />
			</g>
		</g>
	</svg>
)
export default HamburgerMenuIcon;
