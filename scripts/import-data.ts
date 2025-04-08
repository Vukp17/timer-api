import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface FirestoreTimestamp {
  __datatype__: 'timestamp';
  value: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface FirestoreData {
  __collections__: {
    users: {
      [key: string]: {
        __collections__: {
          clients?: {
            [key: string]: {
              name: string;
              email?: string;
              address?: string;
              note?: string;
              status?: string;
            };
          };
          project?: {
            [key: string]: {
              name: string;
              hourly_rate?: number;
              currency?: string;
              color?: string;
              status?: string;
              client_id?: string;
              note?: string;
            };
          };
          tag?: {
            [key: string]: {
              name: string;
              color: string;
              status?: string;
            };
          };
          timers?: {
            [key: string]: {
              startTime: FirestoreTimestamp;
              endTime?: FirestoreTimestamp;
              duration?: string;
              project?: string;
              taskName?: string;
              tag?: string;
              isBillable?: boolean;
            };
          };
        };
      };
    };
  };
}

function convertFirestoreTimestamp(timestamp: FirestoreTimestamp): Date {
  return new Date(timestamp.value._seconds * 1000);
}

async function importData() {
  try {
    // Read the backup file
    const backupPath = path.join(process.cwd(), 'backup.json');
    const backupData: FirestoreData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // Process each user from Firestore
    for (const [userId, userData] of Object.entries(backupData.__collections__.users)) {
      
      // Create a new user for each Firestore user
      if(!userId || !userData) continue;
      const user = await prisma.user.create({
        data: {
          email: `${userId}@import.temp`,  // Temporary email that you can update later
          username: userId,                 // Using Firestore ID as username temporarily
          password: 'temporary-password',   // Temporary password that you should change
        },
      });

      const collections = userData.__collections__;
      const clientMap = new Map(); // Store client ID mappings
      const projectMap = new Map(); // Store project ID mappings
      const tagMap = new Map(); // Store tag ID mappings

      // Import clients
      if (collections.clients) {
        for (const [clientId, clientData] of Object.entries(collections.clients)) {
          const newClient = await prisma.client.create({
            data: {
              name: clientData.name,
              email: clientData.email || null,
              address: clientData.address || null,
              userId: user.id,
            },
          });
          clientMap.set(clientId, newClient.id);
        }
      }

      // Import projects
      if (collections.project) {
        for (const [projectId, projectData] of Object.entries(collections.project)) {
          const clientId = projectData.client_id ? clientMap.get(projectData.client_id) : null;

          const newProject = await prisma.project.create({
            data: {
              name: projectData.name,
              hourlyRate: Number(projectData.hourly_rate) || 0,
              currency: projectData.currency || 'EUR',
              color: projectData.color || '#000000',
              status: projectData.status === 'active' ? 'ACTIVE' : 'INACTIVE',
              description: projectData.note || null,
              userId: user.id,
              clientId: clientId || null,
            },
          });
          projectMap.set(projectId, newProject.id);
        }
      }

      // Import tags
      if (collections.tag) {
        for (const [tagId, tagData] of Object.entries(collections.tag)) {
          const newTag = await prisma.tag.create({
            data: {
              name: tagData.name,
              color: tagData.color || '#000000',
              userId: user.id,
            },
          });
          tagMap.set(tagId, newTag.id);
        }
      }

      // Import timers
      if (collections.timers) {
        for (const [timerId, timerData] of Object.entries(collections.timers)) {
          const startTime = convertFirestoreTimestamp(timerData.startTime);
          const endTime = timerData.endTime ? convertFirestoreTimestamp(timerData.endTime) : null;

          // Find associated project and tag
          let projectId = null;
          if (timerData.project) {
            // Find project by name
            const project = await prisma.project.findFirst({
              where: {
                name: timerData.project,
                userId: user.id
              }
            });
            projectId = project?.id || null;
          }

          let tagId = null;
          if (timerData.tag) {
            // Find tag by name
            const tag = await prisma.tag.findFirst({
              where: {
                name: timerData.tag,
                userId: user.id
              }
            });
            tagId = tag?.id || null;
          }

          await prisma.timer.create({
            data: {
              startTime,
              endTime,
              description: timerData.taskName || null,
              duration: endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : null,
              userId: user.id,
              projectId: projectId,
              tagId: tagId,
              hourlyRate: projectId ? (await prisma.project.findUnique({ where: { id: projectId } }))?.hourlyRate || 0 : 0,
            },
          });
        }
      }

    }

  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData(); 