import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  ViewToken,
} from "react-native";

import { Text, View } from "../../components/Themed";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Job, JobSchema } from "../../features/jobs";
import { Spinner } from "@gluestack-ui/themed";
import { Share } from "react-native";
import { mockedJobsDataSet } from "../../features/jobs/mock";
import SkeletonContent from "react-native-skeleton-content";

const pageSize = 10;
const offsetJobsPreLoad = 3;
const jobWidth = 250;
const skeletonKeyPreffix = "skeleton";

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
    gap: 8,
    margin: 20,
  },
  jobContainer: {
    width: jobWidth,
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
  const [lastViewableItemIndex, setLastViewableItemIndex] = useState(0);

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

  const handleRefresh = useCallback(() => {
    infiniteQuery.refetch();
  }, []);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setLastViewableItemIndex(viewableItems.at(-1)?.index ?? 0);
    },
    []
  );

  console.log(infiniteQuery.isLoading, infiniteQuery.hasNextPage);

  useEffect(() => {
    if (
      (infiniteQuery.data?.pages?.reduce((acc, v) => acc + v.length, 0) || 0) -
        lastViewableItemIndex <=
      offsetJobsPreLoad
    )
      infiniteQuery.fetchNextPage();
  }, [lastViewableItemIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jobs</Text>
      <FlatList
        horizontal={false}
        contentContainerStyle={styles.jobsWrapper}
        columnWrapperStyle={{ gap: 8 }}
        numColumns={Math.floor(Dimensions.get("window").width / jobWidth)}
        onRefresh={handleRefresh}
        refreshing={infiniteQuery.isRefetching}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item: job, index: i }) =>
          job === "skeleton" ? (
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
              key={`${skeletonKeyPreffix}-${i}`}
            ></SkeletonContent>
          ) : (
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
          )
        }
        data={[
          ...(infiniteQuery.data?.pages?.flatMap((page) => page) ?? []),
          ...(infiniteQuery.hasNextPage
            ? new Array(pageSize).fill(0).map((_, i) => "skeleton" as const)
            : []),
        ]}
        ListFooterComponent={
          !infiniteQuery.isLoading && !infiniteQuery.hasNextPage ? (
            <Text
              style={{ textAlign: "center", fontSize: 20, marginVertical: 32 }}
            >
              You saw all the availables Jobs ! 🥳
            </Text>
          ) : null
        }
      />
    </View>
  );
}
