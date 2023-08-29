import { Image, ScrollView, StyleSheet } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { z } from "zod";
import { JobSchema } from "../../features/jobs";
import { Spinner } from "@gluestack-ui/themed";

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

  console.log(infiniteQuery);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jobs</Text>
      <ScrollView
        onScrollEndDrag={() => console.log("sfddsf")}
        onScroll={({ nativeEvent }) => {
          const endOfScroll =
            nativeEvent.layoutMeasurement.height +
              nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - loaderHeight;

          if (endOfScroll) infiniteQuery.fetchNextPage();
        }}
        scrollEventThrottle={400}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 20,
          }}
        >
          {infiniteQuery.data?.pages?.flatMap((page) =>
            page.map((job) => (
              <View
                key={job.id}
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
                <Text style={{ fontSize: 19 }}>{job.title}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "rgb(211 211 211)", fontSize: 16 }}>
                    {job.descriptor}
                  </Text>
                  <Text style={{ color: "rgb(186 186 186)", fontSize: 16 }}>
                    {job.type}
                  </Text>
                </View>
                <Text style={{ color: "rgb(140 140 140)" }}>{job.area}</Text>
              </View>
            ))
          )}
        </View>
        {infiniteQuery.hasNextPage ? (
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
