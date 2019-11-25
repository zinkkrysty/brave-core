//
//  BATContributionInfoMigrationPolicy.h
//  CoreDataHolder
//
//  Created by Kyle Hickinson on 2019-11-25.
//  Copyright © 2019 Kyle Hickinson. All rights reserved.
//

#import <CoreData/CoreData.h>

NS_ASSUME_NONNULL_BEGIN

@interface BATContributionInfoMigrationPolicy : NSEntityMigrationPolicy

- (double)amountFromProbi:(NSString *)probi;

@end

NS_ASSUME_NONNULL_END
