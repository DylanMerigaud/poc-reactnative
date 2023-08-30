import {
  Alert,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Text, View } from "../../components/Themed";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod";
import { Job, JobSchema } from "../../features/jobs";
import { Spinner } from "@gluestack-ui/themed";
import { Share } from "react-native";
import { mockedJobsDataSet } from "../../features/jobs/mock";
import SkeletonContent from "react-native-skeleton-content";

const pageSize = 10;
const offsetPreLoad = 600;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Platform.OS === "web" ? ("100vh" as "100%") : "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
  },
  jobsWrapper: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    margin: 20,
  },
  jobContainer: {
    width: 250,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgb(170, 170, 170)",
    borderRadius: 3,
    height: 475,
  },
  jobImage: {
    width: 225,
    height: 225,
    alignSelf: "center",
  },
  jobTitle: {
    fontSize: 22,
    marginTop: 6,
  },
  jobAreaTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  jobArea: {
    color: "rgb(211 211 211)",
    fontSize: 16,
  },
  jobType: {
    color: "rgb(186 186 186)",
    fontSize: 16,
  },
  jobDescriptor: {
    color: "rgb(140 140 140)",
    marginTop: 2,
  },
  jobDayRate: {
    color: "rgb(255 255 205)",
    fontSize: 20,
    textAlign: "right",
    marginTop: 4,
  },
});

export default function Jobs() {
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["jobs"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = mockedJobsDataSet.slice(
        pageParam * pageSize,
        (pageParam + 1) * pageSize
      );
      return await new Promise<Job[]>((res) =>
        setTimeout(() => res(z.array(JobSchema).parse(response)), 500)
      );
    },
    getNextPageParam: (lastPage, pages) => {
      return pages.reduce((acc, v) => acc + v.length, 0) + lastPage.length !==
        mockedJobsDataSet.length
        ? pages.length + 1
        : undefined;
    },
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
            nativeEvent.contentSize.height - 1 - offsetPreLoad;

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
        <View style={styles.jobsWrapper}>
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
                <View style={styles.jobContainer}>
                  <Image style={styles.jobImage} source={{ uri: job.image }} />
                  <Text style={styles.jobTitle}>
                    {job.title} ({job.company})
                  </Text>
                  <View style={styles.jobAreaTypeContainer}>
                    <Text style={styles.jobArea}>{job.area}</Text>
                    <Text style={styles.jobType}>{job.type}</Text>
                  </View>
                  <Text style={styles.jobDescriptor} numberOfLines={3}>
                    {job.descriptor}
                  </Text>
                  <Text style={styles.jobDayRate}>
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
          <InViewPort onChange={(isVisible) => this.checkVisible(isVisible)}>
            <View></View>
          </InViewPort>
          {infiniteQuery.isLoading || infiniteQuery.isFetchingNextPage || 1
            ? new Array(pageSize).fill(0).map((_, i) => (
                <SkeletonContent
                  containerStyle={styles.jobContainer}
                  isLoading={true}
                  layout={[
                    {
                      key: "image",
                      ...styles.jobImage,
                    },
                    {
                      key: "title",
                      ...styles.jobTitle,
                      width: 150,
                      height: 22,
                    },
                    {
                      key: "areaType",
                      ...styles.jobAreaTypeContainer,
                      width: 200,
                      height: styles.jobArea.fontSize,
                    },
                    {
                      key: "descriptor",
                      ...styles.jobDescriptor,
                      width: "100%",
                      height: 120,
                    },
                    {
                      key: "dayRate",
                      ...styles.jobDayRate,
                      right: 0,
                      width: 100,
                      marginLeft: "auto",
                      height: styles.jobDayRate.fontSize,
                    },
                  ]}
                  key={i}
                ></SkeletonContent>
              ))
            : null}
        </View>
        {/* {infiniteQuery.isLoading || infiniteQuery.isFetchingNextPage ? (
          <Spinner size="large" style={{ height: 100 }} />
        ) : null} */}
        {!infiniteQuery.isLoading && !infiniteQuery.hasNextPage ? (
          <Text
            style={{ textAlign: "center", fontSize: 20, marginVertical: 32 }}
          >
            You saw all the availables Jobs ! 🥳
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}