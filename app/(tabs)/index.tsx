import {
  Alert,
  Button,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
} from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import { JobSchema } from "../../features/jobs";
import { Spinner } from "@gluestack-ui/themed";
import { Share } from "react-native";

const loaderHeight = 100;

export default function JobsScreen() {
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["jobs"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `https://64ee0d561f87218271423d22.mockapi.io/api/v1/jobs?limit=10&page=${pageParam}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return z.array(JobSchema).parse(await response.json());
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length > 0 ? pages.length + 1 : undefined,
  });

  const onRefresh = useCallback(() => {
    infiniteQuery.refetch();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jobs</Text>
      <ScrollView
        onScroll={({ nativeEvent }) => {
          const endOfScroll =
            nativeEvent.layoutMeasurement.height +
              nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - loaderHeight;

          if (endOfScroll) infiniteQuery.fetchNextPage();
        }}
        refreshControl={
          <RefreshControl
            refreshing={infiniteQuery.isRefetching}
            onRefresh={onRefresh}
          />
        }
        scrollEventThrottle={400}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
            marginTop: 20,
            marginHorizontal: 20,
          }}
        >
          {infiniteQuery.data?.pages?.flatMap((page) =>
            page.map((job) => (
              <Pressable
                key={job.id}
                onPress={async () => {
                  try {
                    const result = await Share.share({
                      title: "Check this job !",
                      message: `Just saw this job on the app, you should check it out !
                        ${job.title} - ${job.descriptor} - ${job.area} - ${
                        job.type
                      } - ${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(job.dayRate)}/day`,
                    });
                    if (result.action === Share.sharedAction) {
                      if (result.activityType) {
                        // shared with activity type of result.activityType
                      } else {
                        // shared
                      }
                    } else if (result.action === Share.dismissedAction) {
                      // dismissed
                    }
                  } catch (error: any) {
                    Alert.alert(error.message);
                  }
                }}
              >
                <View
                  style={{
                    width: 250,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "rgb(170, 170, 170)",
                    borderRadius: 3,
                  }}
                >
                  <Image
                    style={{ width: 225, height: 225, alignSelf: "center" }}
                    source={{ uri: job.image }}
                  />
                  <Text style={{ fontSize: 22, marginTop: 6 }}>
                    {job.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 6,
                    }}
                  >
                    <Text style={{ color: "rgb(211 211 211)", fontSize: 16 }}>
                      {job.descriptor}
                    </Text>
                    <Text style={{ color: "rgb(186 186 186)", fontSize: 16 }}>
                      {job.type}
                    </Text>
                  </View>
                  <Text style={{ color: "rgb(140 140 140)", marginTop: 2 }}>
                    {job.area}
                  </Text>
                  <Text
                    style={{
                      color: "rgb(255 255 205)",
                      fontSize: 20,
                      textAlign: "right",
                      marginTop: 4,
                    }}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(job.dayRate)}
                    /day
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
        {infiniteQuery.hasNextPage || infiniteQuery.isLoading ? (
          <Spinner size="large" style={{ height: loaderHeight }} />
        ) : (
          <Text
            style={{ textAlign: "center", fontSize: 20, marginVertical: 32 }}
          >
            You saw all the availables Jobs ! 🥳
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
