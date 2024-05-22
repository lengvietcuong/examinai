import Header from "@/components/header/Header";
import SideBar from "@/components/sidebar/SideBar";
import DesktopSideBarToggler from "@/components/sidebar/DesktopSidebarToggler";
import Greeting from "@/components/chat/message/Greeting";
import Conversation from "@/components/chat/Conversation";
import TextInput from "@/components/chat/TextInput";
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
