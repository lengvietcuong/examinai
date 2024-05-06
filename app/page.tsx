import Header from "@/components/header/Header";
import DesktopSidebar from "@/components/sidebar/DesktopSidebar";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import DesktopSideBarToggler from "@/components/sidebar/DesktopSidebarToggler";
import Greeting from "@/components/message/Greeting";
import Conversation from "@/components/Conversation";
import TextInput from "@/components/TextInput";
import styles from "./page.module.css";

export default function Home() {
	return (
		<main className={styles.main}>
			<DesktopSidebar />
			<MobileSidebar />
			<div className={styles.content}>
				<div className={styles.headerChatContainer}>
					<Header />
					<DesktopSideBarToggler />
					<div className={styles.chat}>
						<Greeting />
						<Conversation />
					</div>
				</div>
				<TextInput />
			</div>
		</main>
	);
}
