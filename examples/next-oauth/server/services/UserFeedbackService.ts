import { inject, injectable } from '@shared/container';
import {
  type UserFeedbackAdminListType,
  type UserFeedbackAdminStatusOkType,
  type UserFeedbackCreateBodyType,
  type UserFeedbackCreateOkType,
  type UserFeedbackListPublicType,
  type UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';
import { UserFeedbackRepository } from '@server/repositorys/UserFeedbackRepository';

/**
 * 用户反馈业务编排（无 GitHub 同步）。
 */
@injectable()
export class UserFeedbackService {
  constructor(
    @inject(UserFeedbackRepository)
    protected readonly feedbackRepository: UserFeedbackRepository
  ) {}

  public async createForCurrentUser(
    body: UserFeedbackCreateBodyType,
    meta: { readonly userAgent: string | null }
  ): Promise<UserFeedbackCreateOkType> {
    const item = await this.feedbackRepository.insertForCurrentUser({
      category: body.category,
      body: body.body,
      pageUrl: body.pageUrl?.trim() ? body.pageUrl.trim() : null,
      userAgent: meta.userAgent,
      clientContext: body.clientContext ?? null
    });
    return { ok: true, item };
  }

  public async listForCurrentUser(): Promise<UserFeedbackListPublicType> {
    const items = await this.feedbackRepository.listForCurrentUser();
    return { items };
  }

  public async listAllForAdmin(): Promise<UserFeedbackAdminListType> {
    const items = await this.feedbackRepository.listAllForAdmin(100);
    return { items };
  }

  public async updateStatusForAdmin(
    feedbackId: string,
    status: UserFeedbackStatusType
  ): Promise<UserFeedbackAdminStatusOkType> {
    const saved = await this.feedbackRepository.updateStatusAsAdmin(
      feedbackId,
      status
    );
    if (saved === null) {
      throw new Error('feedback not found');
    }
    return { ok: true, id: feedbackId, status: saved };
  }
}
