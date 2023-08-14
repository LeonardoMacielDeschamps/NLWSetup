import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { api } from '../lib/axios';

import { BackButton } from '../components/BackButton';
import { ProgressBar } from '../components/ProgressBar';
import { Checkbox } from '../components/Checkbox';
import { Loading } from '../components/Loading';
import { HabitsEmpty } from '../components/HabitsEmpty';

interface Params {
  date: string;
}

interface HabitsInfoProps {
  possibleHabits: {
    id: string;
    title: string;
    createdAt: string;
  }[];
  completedHabits: string[];
}

export function Habit() {
  const [loading, setLoading] = useState(true);
  const [habitsInfo, setHabitsInfo] = useState<HabitsInfoProps>();

  const { goBack } = useNavigation();

  const route = useRoute();
  const { date } = route.params as Params;

  const parsedDate = dayjs(date);
  const isDateInPast = parsedDate.isBefore(new Date(), 'day');
  const weekDay = parsedDate.format('dddd');
  const dayAndMonth = parsedDate.format('DD/MM');

  let completedPercentage = 0;

  if (habitsInfo?.possibleHabits.length) {
    completedPercentage = 100 * habitsInfo.completedHabits.length / habitsInfo.possibleHabits.length;
  }

  async function fetchHabits() {
    try {
      setLoading(true);
      const { data } = await api.get('/day', { params: { date: date } });
      setHabitsInfo(data);
    }
    catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os hábitos');
      console.log(error);
      goBack();
    }
    finally {
      setLoading(false);
    }
  }

  async function handleToggleHabit(habitId: string) {
    try {
      await api.patch(`/habit/${habitId}/toggle`);

      setHabitsInfo(prevState => {
        const possibleHabits = prevState!.possibleHabits;

        let completedHabits = prevState!.completedHabits;

        if (completedHabits!.includes(habitId)) {
          completedHabits = completedHabits.filter(id => id !== habitId);
        }
        else {
          completedHabits = [...habitsInfo!.completedHabits, habitId];
        }

        return { possibleHabits, completedHabits };
      });
    }
    catch (error) {
      alert('Não foi possível alternar a seleção do hábito.');
      console.log(error);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <View className='flex-1 bg-background px-8 pt-16'>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className='mt-6 text-zinc-400 font-semibold text-base lowercase'>
          {weekDay}
        </Text>

        <Text className='text-white font-extrabold text-3xl'>
          {dayAndMonth}
        </Text>

        <ProgressBar progress={completedPercentage} />

        <View className={clsx('mt-6', { 'opacity-50': isDateInPast })}>
          {
            habitsInfo?.possibleHabits.map(habit => (
              <Checkbox
                key={habit.id}
                title={habit.title}
                onPress={() => handleToggleHabit(habit.id)}
                checked={habitsInfo.completedHabits.includes(habit.id)}
                disabled={isDateInPast}
              />
            )) ?? <HabitsEmpty />
          }
        </View>

        {
          isDateInPast && (
            <Text className='text-white mt-10 text-center'>
              Não é possível editar hábitos de uma data passada.
            </Text>
          )
        }
      </ScrollView>
    </View>
  );
}