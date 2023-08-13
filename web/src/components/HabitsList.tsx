import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'phosphor-react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { api } from '../lib/axios';

interface HabitsListProps {
  date: Date;
  onCompletedChanged: (completed: number) => void;
}

interface HabitsInfoProps {
  possibleHabits: {
    id: string;
    title: string;
    createdAt: string;
  }[];
  completedHabits: string[];
}

export function HabitsList({ date, onCompletedChanged }: HabitsListProps) {
  const [habitsInfo, setHabitsInfo] = useState<HabitsInfoProps>();

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

        onCompletedChanged(completedHabits.length);

        return { possibleHabits, completedHabits };
      });
    }
    catch (error) {
      alert('Não foi possível alternar a seleção do hábito.');
      console.log(error);
    }
  }

  async function fetchData() {
    try {
      const { data } = await api.get('/day', {
        params: {
          date: date.toISOString()
        }
      });

      setHabitsInfo(data);
    }
    catch (error) {
      alert('Não foi possível carregar os hábitos.');
      console.log(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className='mt-6 flex flex-col gap-3'>
      {
        habitsInfo?.possibleHabits.map(habit => (
          <Checkbox.Root
            key={habit.id}
            className='flex items-center gap-3 focus:outline-none disabled:cursor-not-allowed group'
            onCheckedChange={() => handleToggleHabit(habit.id)}
            checked={habitsInfo.completedHabits.includes(habit.id)}
            disabled={dayjs(date).isBefore(new Date(), 'day')}
          >
            <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-600 group-focus:ring-offset-2 group-focus:ring-offset-background'>
              <Checkbox.Indicator>
                <Check size={20} className='text-white'>
                </Check>
              </Checkbox.Indicator>
            </div>

            <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400'>
              {habit.title}
            </span>
          </Checkbox.Root>
        ))
      }
    </div>
  );
}