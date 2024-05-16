import Header from "@/components/header/Header";
import SideBar from "@/components/sidebar/SideBar";
import DesktopSideBarToggler from "@/components/sidebar/DesktopSidebarToggler";
import Greeting from "@/components/message/Greeting";
import Conversation from "@/components/Conversation";
import TextInput from "@/components/TextInput";
import styles from "./page.module.css";

export default function Home() {
	return (
		<div className={styles.layout}>
			<SideBar />
			<main className={styles.mainContent}>
				<DesktopSideBarToggler />
				<Header />
				<div className={styles.chat}>
					<Greeting />
					<Conversation />
				</div>
				<TextInput />
			</main>
		</div>
	);
}
