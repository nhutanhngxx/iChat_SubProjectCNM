import React, { useEffect, useRef, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { Tab, TabView } from "@rneui/themed";

const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (route.params?.autoFocus) {
      searchInputRef.current?.focus();
    }
  }, [route.params]);

  const [searchText, setSearchText] = useState("");
  const [index, setIndex] = useState(0);

  // Dữ liệu tìm kiếm giả lập
  const history = ["Hà Nội", "React Native", "Chat App"];
  const contacts = ["Nguyễn Nhựt Anh", "Trần Minh Quân", "Lê Phương Thảo"];

  // Kết quả tìm kiếm trả về của Tin nhắn => click vào sẽ vào cuộc trò chuyện
  const messages = [{ id: "1", type: "message", content: searchText }];
  // Kết quả tìm kiếm trả về của Tài khoản (Hiển thị avt, tên, call => click vào sẽ vào cuộc trò chuyện)
  const users = [
    //     { id: "3", type: "user", name: searchText + " Nguyễn Nhựt Anh" },
  ];

  // Kết hợp tin nhắn và tài khoản
  const allResults = [...messages, ...users];

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Thanh tìm kiếm */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          height: 50,
          backgroundColor: "#0AA2F8",
          paddingHorizontal: 10,
          // paddingVertical: 5,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/icons/go-back.png")}
            style={{ width: 20, height: 20, tintColor: "white" }}
          />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 5,
            marginHorizontal: 5,
          }}
        >
          <TextInput
            ref={searchInputRef}
            style={{ flex: 1, fontSize: 16, paddingHorizontal: 5, height: 35 }}
            placeholder="Tìm kiếm"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Image
                source={require("../../assets/icons/close.png")}
                style={{ width: 20, height: 20, marginLeft: 5 }}
              />
            </TouchableOpacity>
          )}
        </View>

        <Image
          source={require("../../assets/icons/qr.png")}
          style={{ width: 20, height: 20, tintColor: "white", marginLeft: 10 }}
        />
      </View>

      {/* Nếu chưa nhập, hiển thị lịch sử & danh bạ */}
      {searchText === "" ? (
        <FlatList
          data={[
            { title: "Lịch sử đã tìm kiếm" },
            ...history,
            { title: "Các liên hệ đã tìm kiếm" },
            ...contacts,
          ]}
          renderItem={({ item }) =>
            item.title ? (
              <Text
                style={{
                  marginVertical: 10,
                  fontWeight: "bold",
                  paddingHorizontal: 10,
                }}
              >
                {item.title}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() => setSearchText(item)}
                style={{ paddingVertical: 5, paddingHorizontal: 15 }}
              >
                <Text style={{ fontSize: 16 }}>{item}</Text>
              </TouchableOpacity>
            )
          }
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <>
          {/* Tabs kết quả tìm kiếm */}
          <Tab
            value={index}
            onChange={setIndex}
            indicatorStyle={{
              backgroundColor: "skyblue",
              width: "15%",
              marginHorizontal: "9%",
            }}
            variant="default"
            dense
          >
            <Tab.Item
              title="Tất cả"
              titleStyle={{ fontSize: 16, fontWeight: "500" }}
            />
            <Tab.Item
              title="Tin nhắn"
              titleStyle={{ fontSize: 16, fontWeight: "500" }}
            />
            <Tab.Item
              title="Tài khoản"
              titleStyle={{ fontSize: 16, fontWeight: "500" }}
            />
          </Tab>

          <TabView value={index} onChange={setIndex} animationType="spring">
            {/* Tab "Tất cả" */}
            <TabView.Item style={{ width: "100%", padding: 10 }}>
              <FlatList
                data={allResults}
                renderItem={({ item }) => (
                  <View style={{ padding: 10 }}>
                    {item.type === "message" ? (
                      <Text style={{ fontSize: 16, color: "blue" }}>
                        {item.content}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 16, color: "green" }}>
                        {item.name}
                      </Text>
                    )}
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />
            </TabView.Item>

            {/* Tab "Tin nhắn" */}
            <TabView.Item style={{ width: "100%", padding: 10 }}>
              {messages && messages.length > 0 ? (
                <FlatList
                  data={messages}
                  renderItem={({ item }) => (
                    <View style={{ padding: 10 }}>
                      <Text style={{ fontSize: 16, color: "blue" }}>
                        {item.content}
                      </Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    color: "gray",
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  Không tìm thấy kết quả phù hợp
                </Text>
              )}
            </TabView.Item>

            {/* Trả về kết quả cho tab "Tài khoản" */}
            <TabView.Item style={{ width: "100%", padding: 10 }}>
              {users && users.length > 0 ? (
                <FlatList
                  data={users}
                  renderItem={({ item }) => (
                    <View style={{ padding: 10 }}>
                      <Text style={{ fontSize: 16, color: "green" }}>
                        {item.name}
                      </Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    color: "gray",
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  Không tìm thấy kết quả phù hợp
                </Text>
              )}
            </TabView.Item>
          </TabView>
        </>
      )}
    </View>
  );
};

export default SearchScreen;
