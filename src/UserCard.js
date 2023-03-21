import { height } from "@mui/system";
import React from "react";
import BC from "./business-card.png";
const styles = {
  container: {
    display: "flex",
    alignItems: "left",
    backgroundColor: "#fff",
    padding: "2px",
    marginTop: "1%",
    borderRadius: "8px",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    minWidth: "100%",
    minHeight: 100,
    align: "center",
  },
  avatarContainer: {
    flex: "0 0 56px",
  },
  avatar: {
    width: "100%",
    borderRadius: "50%",
    marginTop: "40%",
  },
  userInfoContainer: {
    flex: "1 1 auto",
  },
  name: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "4px",
  },
  email: {
    fontSize: "14px",
    color: "#666",
  },
};

const UserCard = ({ user }) => {
  return (
    <div style={styles.container}>
      <div style={styles.avatarContainer}>
        <img src={BC} style={styles.avatar} />
      </div>
      <div style={styles.userInfoContainer}>
        <div style={styles.name}>{user.name}</div>
        <div style={styles.email}>{user.user}</div>
      </div>
    </div>
  );
};

export default UserCard;
