import { CacheHandler } from '../handler';
import { FSGroup, Group, IGroup, GroupRepo } from '../../group';

export class GroupCacheHandler extends CacheHandler<FSGroup, Group, IGroup> {
  constructor() {
    super(GroupRepo, ['findByName', 'count']);
  }

  async findByName(name: string): Promise<Group | FSGroup> {
    return (await this.queueable.exec(
      'findByName',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) => e.name === name);
      },
    )) as Group | FSGroup;
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }
}
