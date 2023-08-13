import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from './lib/prisma';
import dayjs from 'dayjs';

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(
        z.number().min(0).max(6)
      )
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    const createdAt = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        createdAt,
        weekDay: {
          create: weekDays.map(weekDay => {
            return { weekDay };
          })
        }
      }
    });
  });

  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date()
    });

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf('day');
    const weekDay = parsedDate.get('day');

    const possibleHabits = await prisma.habit.findMany({
      where: {
        createdAt: {
          lte: date
        },
        weekDay: {
          some: {
            weekDay
          }
        }
      }
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate()
      },
      include: {
        dayHabit: true
      }
    });

    const completedHabits = day?.dayHabit.map(habit => {
      return habit.habitId;
    }) ?? [];

    return {
      possibleHabits,
      completedHabits
    };
  });

  app.patch('/habit/:id/toggle', async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid()
    });

    const { id } = toggleHabitParams.parse(request.params);

    const today = dayjs().startOf('day').toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today
      }
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today
        }
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        dayId_habitId: {
          dayId: day.id,
          habitId: id
        }
      }
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id
        }
      });
    }
    else {
      await prisma.dayHabit.create({
        data: {
          dayId: day.id,
          habitId: id
        }
      });
    }
  });

  app.get('/summary', async () => {
    const summary = await prisma.$queryRaw`
      SELECT
        day.id,
        day.date,
        (
          SELECT
            cast(count(*) AS float)
          FROM day_habit
          WHERE day_habit.dayId = day.id
        ) AS completed,
        (
          SELECT
            cast(count(*) AS float)
          FROM habit_week_day
          JOIN habit
            ON habit.id = habit_week_day.habitId
          WHERE
            habit_week_day.weekDay = cast(strftime('%w', day.date/1000.0, 'unixepoch') AS int)
            AND habit.createdAt <= day.date
        ) AS amount
      FROM day
    `;

    return summary;
  });
}