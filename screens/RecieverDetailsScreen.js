import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Card, Header, Icon } from "react-native-elements";
import firebase from "firebase";

import db from "../config.js";

export default class RecieverDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: firebase.auth().currentUser.email,
      userName: "",
      recieverId: this.props.navigation.getParam("details")["user_id"],
      requestId: this.props.navigation.getParam("details")["request_Id"],
      item_name_toGive: this.props.navigation.getParam("details")[
        "item_name_toGive"
      ],
      item_name_toGet: this.props.navigation.getParam("details")[
        "item_name_toGet"
      ],
      reason_for_requesting: this.props.navigation.getParam("details")[
        "description"
      ],
      recieverName: "",
      recieverContact: "",
      recieverAddress: "",
      recieverRequestDocId: "",
      DonaterAddress: "",
    };
  }

  getRecieverDetails() {
    db.collection("users")
      .where("email_id", "==", this.state.recieverId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            recieverName: doc.data().first_name,
            recieverContact: doc.data().contact,
            recieverAddress: doc.data().address,
          });
        });
      });

    db.collection("exchange_requests")
      .where("request_id", "==", this.state.requestId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({ recieverRequestDocId: doc.id });
        });
      });
  }

  getUserDetails = (userId) => {
    db.collection("users")
      .where("email_id", "==", userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            userName: doc.data().first_name + " " + doc.data().last_name,
            DonaterAddress: doc.data().address,
          });
        });
      });
  };

  updateItemStatus = () => {
    db.collection("all_barters").add({
      item_name_toGet: this.state.item_name_toGet,
      item_name_toGive: this.state.item_name_toGive,
      request_id: this.state.requestId,
      requested_by: this.state.recieverName,
      donor_id: this.state.userId,
      request_status: "Donor Interested",
    });
  };

  addNotification = () => {
    var message =
      this.state.userName +
      " has shown interest in donating the Item" +
      " " +
      "\n His address is" + " " +
      this.state.DonaterAddress +
      " " +
      "\n Knidly deliver Your item as soon as Possible";
    console.log(message);
    db.collection("all_notifications").add({
      targeted_user_id: this.state.recieverId,
      donor_id: this.state.userId,
      request_id: this.state.requestId,
      item_name_toGive: this.state.item_name_toGive,
      item_name_toGet: this.state.item_name_toGet,
      date: firebase.firestore.FieldValue.serverTimestamp(),
      notification_status: "unread",
      message: message,
      DonaterAddress: this.state.DonaterAddress,
    });
  };

  componentDidMount() {
    this.getRecieverDetails();
    this.getUserDetails(this.state.userId);
  }

  render() {
    console.log(this.state.DonaterAddress);

    return (
      <View style={styles.container}>
        <ScrollView style={{ width: "100%" }}>
          <View style={{ flex: 0.1 }}>
            <Header
              leftComponent={
                <Icon
                  name="arrow-left"
                  type="feather"
                  color="#696969"
                  onPress={() => this.props.navigation.goBack()}
                />
              }
              centerComponent={{
                text: "Barter Items",
                style: { color: "#90A5A9", fontSize: 20, fontWeight: "bold" },
              }}
              backgroundColor="#eaf8fe"
            />
          </View>
          <View style={{ flex: 0.3 }}>
            <Card title={"Barter Information"} titleStyle={{ fontSize: 20 }}>
              <Text>
                You are requested to take Screenshot of these details before
                clicking the Barter Button
              </Text>
              <ScrollView style={{ width: "100%" }}>
                <Card>
                  <Text style={{ fontWeight: "bold" }}>
                    You Have To give : {this.state.item_name_toGive}
                  </Text>
                </Card>
                <Card>
                  <Text style={{ fontWeight: "bold" }}>
                    You Will Get : {this.state.item_name_toGet}
                  </Text>
                </Card>
                <Card>
                  <Text style={{ fontWeight: "bold" }}>
                    Reason : {this.state.reason_for_requesting}
                  </Text>
                </Card>
              </ScrollView>
            </Card>
          </View>
          <View style={{ flex: 0.3, marginTop: 45 }}>
            <Card title={"Reciever Information"} titleStyle={{ fontSize: 20 }}>
              <Card>
                <Text style={{ fontWeight: "bold" }}>
                  Name: {this.state.recieverName}
                </Text>
              </Card>
              <Card>
                <Text style={{ fontWeight: "bold" }}>
                  Contact: {this.state.recieverContact}
                </Text>
              </Card>
              <Card>
                <Text style={{ fontWeight: "bold" }}>
                  Address: {this.state.recieverAddress}
                </Text>
              </Card>
            </Card>
          </View>
          <View style={styles.buttonContainer}>
            {this.state.recieverId !== this.state.userId ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  this.updateItemStatus();
                  this.addNotification();
                  this.props.navigation.navigate("MyDonations");
                }}
              >
                <Text>I want to Perform Barter</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "orange",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 16,
  },
});
