import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import firebase from "firebase";
import db from "../config";
import MyHeader from "../components/MyHeader";

export default class ExchangeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      item_name_toGet: "",
      item_name_toGive: "",
      description: "",
      IsItemRequestActive: "",
      itemStatus: "",
      requestId: "",
      userDocId: "",
      docId: "",
      requestedItemName: "",
      itemNameToGive: "",
    };
  }

  createUniqueId() {
    return Math.random().toString(36).substring(7);
  }

  addItem = async (item_name_toGive, item_name_toGet, description) => {
    var userName = this.state.userId;
    var randomRequestId = this.createUniqueId();
    db.collection("exchange_requests").add({
      user_id: userName,
      item_name_toGive: item_name_toGive,
      item_name_toGet: item_name_toGet,
      description: description,
      request_Id: randomRequestId,
      item_status: "requested",
      date: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await this.getItemRequest();
    db.collection("users")
      .where("email_id", "==", userId)
      .get()
      .then()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            IsItemRequestActive: true,
          });
        });
      });

    this.setState({
      item_name_toGet: "",
      item_name_toGive: "",
      description: "",
      requestId: randomRequestId,
    });

    return Alert.alert("Item ready to exchange", "", [
      {
        text: "0K",
        onPress: () => {
          this.props.navigation.navigate("HomeScreen");
        },
      },
    ]);
  };

  allBarters = (ItemName) => {
    var userId = this.state.userId;
    var requestId = this.state.requestId;
    db.collection("exchange_requests").add({
      user_id: userId,
      item_name: ItemName,
      request_id: requestId,
      itemStatus: "received",
    });
  };

  getIsItemRequestActive() {
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState({
            IsItemRequestActive: doc.data().IsItemRequestActive,
            userDocId: doc.id,
          });
        });
      });
  }

  getItemRequest = () => {
    var ItemRequest = db
      .collection("exchange_requests")
      .where("user_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().item_status !== "received") {
            this.setState({
              requestId: doc.data().request_Id,
              requestedItemName: doc.data().item_name_toGet,
              itemNameToGive: doc.data().item_name_toGive,
              itemStatus: doc.data().item_status,
              docId: doc.id,
            });
          }
        });
      });
  };

  sendNotification = () => {
    //to get the first name and last name
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var name = doc.data().first_name;
          var lastName = doc.data().last_name;

          db.collection("all_notifications")
            .where("request_id", "==", this.state.requestId)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                var donorId = doc.data().donor_id;
                var itemNameToGet = doc.data().item_name_toGet;
                var itemNameToGive = doc.data().item_name_toGive;

                //targert user id is the donor id to send notification to the user
                db.collection("all_notifications").add({
                  targeted_user_id: donorId,
                  message:
                    name +
                    " " +
                    lastName +
                    " received the Item:" +
                    itemNameToGive,
                  notification_status: "unread",
                  item_name_toGive: itemNameToGive,
                });
              });
            });
        });
      });
  };

  componentDidMount() {
    this.getItemRequest();
    this.getIsItemRequestActive();
  }

  updateItemRequestStatus = () => {
    db.collection("exchange_requests").doc(this.state.docId).update({
      item_status: "recieved",
    });

    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            IsItemRequestActive: false,
          });
        });
      });
  };

  render() {
    if (this.state.IsItemRequestActive === true) {
      return (
        // Status screen

        <View style={{ flex: 1, justifyContent: "center" }}>
          <View
            style={{
              borderColor: "orange",
              borderWidth: 2,
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
              margin: 10,
            }}
          >
            <Text>Item Name To Get</Text>
            <Text>{this.state.requestedItemName}</Text>
          </View>
          <View
            style={{
              borderColor: "orange",
              borderWidth: 2,
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
              margin: 10,
            }}
          >
            <Text>Item Name To Give</Text>
            <Text>{this.state.itemNameToGive}</Text>
          </View>
          <View
            style={{
              borderColor: "orange",
              borderWidth: 2,
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
              margin: 10,
            }}
          >
            <Text> Item Status </Text>

            <Text>{this.state.itemStatus}</Text>
          </View>

          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: "orange",
              backgroundColor: "orange",
              width: 300,
              alignSelf: "center",
              alignItems: "center",
              height: 30,
              marginTop: 30,
            }}
            onPress={() => {
              this.sendNotification();
              this.updateItemRequestStatus();
              this.allBarters(this.state.requestedItemName);
            }}
          >
            <Text>I recieved the item and sended the same </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <MyHeader title="Request Items" navigation={this.props.navigation} />

          <TextInput
            style={styles.itemname}
            placeholder="Item Name You want To Get"
            onChangeText={(text) => {
              this.setState({
                item_name_toGet: text,
              });
            }}
          />

          <TextInput
            style={styles.itemname}
            placeholder="Item Name you Can Give"
            onChangeText={(text) => {
              this.setState({
                item_name_toGive: text,
              });
            }}
          />
          <TextInput
            style={styles.itemname}
            placeholder="Description(Why You want It)"
            onChangeText={(text) => {
              this.setState({
                description: text,
              });
            }}
          />
          <TouchableOpacity
            onPress={() => {
              this.addItem(
                this.state.item_name_toGive,
                this.state.item_name_toGet,
                this.state.description
              );
            }}
            style={styles.button}
          >
            <Text>Submit</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8BE85",
  },
  itemname: {
    width: 300,
    height: 40,
    borderBottomWidth: 1.5,
    borderColor: "#ff8a65",
    fontSize: 20,
    margin: 10,
    paddingLeft: 10,
    alignItems: "center",
    marginLeft: 450,
    marginTop: 20,
  },
  button: {
    width: 100,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff5722",
    shadowColor: "#000",
    marginLeft: 450,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },
});
