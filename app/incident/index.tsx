import { Alert, Button, Switch, Text, TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitIncidentSchema } from "@/app/incident/types";
import MapView, { Marker } from "react-native-maps";
import { useLocation } from "@/hooks/useLocation";
import { useEffect } from "react";
import { z } from "zod";
import { useFakeDataStore } from "@/app/data/hooks";
import { useShallow } from "zustand/shallow";
import { useRouter } from "expo-router";

export default function IncidentForm() {
  const router = useRouter();
  const { region } = useLocation();
  const [problems, setProblems] = useFakeDataStore(
    useShallow((state) => [state.problems, state.setProblems])
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(submitIncidentSchema),
    defaultValues: {
      id: problems[problems.length - 1].id + 1,
      title: "",
      description: "",
      status: "Open" as const,
      date: "",
      location: {
        latitude: 0,
        longitude: 0,
      },
      verified: false,
    },
  });

  const onSubmit = (data: z.infer<typeof submitIncidentSchema>) => {
    setProblems([...problems, data]);
    Alert.alert("Thank you for helping to keep the streets clean!", undefined, [
      {
        text: "Go back to the map",
        onPress: () => {
          router.back();
        },
      },
    ]);
  };

  // Watch location values
  const location = watch("location");

  useEffect(() => {
    (() => {
      if (region) {
        setValue("location.latitude", region.latitude);
        setValue("location.longitude", region.longitude);
      }
    })();
  }, [region]);

  return (
    <View className="flex-1 p-6 bg-gray-900">
      <Text className="text-white text-lg font-bold mb-2">Title</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onBlur={onBlur}
            onChangeText={(value) => onChange(value)}
            className="bg-gray-800 text-white p-4 rounded-lg mb-2"
            placeholder="Enter Title"
            placeholderTextColor="#9CA3AF"
          />
        )}
      />
      {errors.title && (
        <Text className="text-red-500">{errors.title.message}</Text>
      )}

      <Text className="text-white text-lg font-bold mt-4">Description</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onBlur={onBlur}
            onChangeText={(value) => onChange(value)}
            className="bg-gray-800 text-white p-4 rounded-lg mb-2"
            placeholder="Enter Description"
            placeholderTextColor="#9CA3AF"
            multiline
          />
        )}
      />
      {errors.description && (
        <Text className="text-red-500">{errors.description.message}</Text>
      )}

      <Text className="text-white text-lg font-bold mt-4">
        Date (YYYY-MM-DD)
      </Text>
      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onBlur={onBlur}
            onChangeText={(value) => onChange(value)}
            className="bg-gray-800 text-white p-4 rounded-lg mb-2"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
        )}
      />
      {errors.date && (
        <Text className="text-red-500">{errors.date.message}</Text>
      )}

      <Text className="text-white text-lg font-bold mt-4 mb-2">Location</Text>
      <MapView
        style={{ height: 300, borderRadius: 10, marginBottom: 10 }}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setValue("location.latitude", latitude); // Update form directly
          setValue("location.longitude", longitude); // Update form directly
        }}
      >
        <Marker
          draggable
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setValue("location.latitude", latitude); // Update form directly
            setValue("location.longitude", longitude); // Update form directly
          }}
        />
      </MapView>
      <Text className="text-gray-400">
        Latitude: {location.latitude.toFixed(4)}
      </Text>
      <Text className="text-gray-400 mb-4">
        Longitude: {location.longitude.toFixed(4)}
      </Text>
      {errors.location && (
        <Text className="text-red-500">Invalid location</Text>
      )}

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}